import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import time

import random
from zipfile import ZipFile
import wget

import torch
import torch.nn as nn
from torchtext import data, vocab
import torch.optim as optim

from preprocessor.tokenizer.tokenizer import TOKENIZERS
from .datasets.germeval import GermEvalDataset, DataframeDataset



SEED = 1234
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
BATCH_SIZE = 64
EMBEDDING_DIM = 300
HIDDEN_DIM = 256
OUTPUT_DIM = 1
N_LAYERS = 2

DEFAULT_MODEL = 'embed_tweets_de_300D_fasttext'

torch.manual_seed(SEED)
torch.backends.cudnn.deterministic = True

class Classifier(nn.Module):
    def __init__(self, vocab_size, pad_idx, embedding_dim=EMBEDDING_DIM, hidden_dim=HIDDEN_DIM, output_dim=OUTPUT_DIM, n_layers=N_LAYERS, 
                 bidirectional=True, dropout=0.5):

        super(Classifier, self).__init__()

        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=pad_idx)
        self.rnn = nn.LSTM(embedding_dim, 
                           hidden_dim, 
                           num_layers=n_layers, 
                           bidirectional=bidirectional, 
                           dropout=dropout)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)
        self.dropout = nn.Dropout(dropout)


    def forward(self, text, text_lengths):
        
        #text = [sent len, batch size]
        
        embedded = self.dropout(self.embedding(text))
        
        #embedded = [sent len, batch size, emb dim]
        
        #pack sequence
        packed_embedded = nn.utils.rnn.pack_padded_sequence(embedded, text_lengths)
        
        packed_output, (hidden, cell) = self.rnn(packed_embedded)
        
        #unpack sequence
        output, output_lengths = nn.utils.rnn.pad_packed_sequence(packed_output)

        #output = [sent len, batch size, hid dim * num directions]
        #output over padding tokens are zero tensors
        
        #hidden = [num layers * num directions, batch size, hid dim]
        #cell = [num layers * num directions, batch size, hid dim]
        
        #concat the final forward (hidden[-2,:,:]) and backward (hidden[-1,:,:]) hidden layers
        #and apply dropout
        
        hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim = 1))
                
        #hidden = [batch size, hid dim * num directions]
            
        return self.fc(hidden)


class TwitterClassifier:
    name = 'Twitter Classifier'
    description = 'This is a classifier for german tweets trained on data from germeval 2018 challenge'

    def __init__(self, tokenizer='spacy_tokenizer', embedder=DEFAULT_MODEL, restore_from_paths=None): 
        self.tokenizer = TOKENIZERS[tokenizer]()
        
        if restore_from_paths:
            text_field_path = restore_from_paths[0]
            classifier_path = restore_from_paths[1]
            self._text_field = self._load_text_field(text_field_path)
            input_dim = len(self._text_field.vocab)
            pad_idx = self._text_field.vocab.stoi[self._text_field.pad_token]
            unk_idx = self._text_field.vocab.stoi[self._text_field.unk_token]
            self.classifier = Classifier(input_dim, pad_idx)
            self.classifier.to(DEVICE)
            self.classifier.embedding.weight.data.copy_(self._text_field.vocab.vectors)
            self.classifier.embedding.weight.data[pad_idx] = torch.zeros(EMBEDDING_DIM)
            self.classifier.embedding.weight.data[unk_idx] = torch.zeros(EMBEDDING_DIM)
            self._load_classifier(classifier_path)
        else:
            self.base_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'germ_eval_objects')
            os.makedirs(self.base_path, exist_ok=True)
            self.embedder = self._initialize_embedder(embedder)
            self.fields = self._initialize_fields()

            train_df, test_df = GermEvalDataset().get_data()
            train_full, self._test_full = DataframeDataset.splits(self.fields, df_trn=train_df, df_test=test_df)
            self._train_df, self._val_df = train_full.split(split_ratio=[0.8, 0.2], stratified=True, strata_field='label', random_state=random.seed(SEED))

            self._build_vocab(train_df)
            self._save_text_field(os.path.join(self.base_path, 'germeval_text_field.pt'))

            input_dim = len(self._text_field.vocab)
            pad_idx = self._text_field.vocab.stoi[self._text_field.pad_token]
            unk_idx = self._text_field.vocab.stoi[self._text_field.unk_token]

            self.classifier = Classifier(input_dim, pad_idx)
            self.classifier.to(DEVICE)
            self.classifier.embedding.weight.data.copy_(self._text_field.vocab.vectors)
            self.classifier.embedding.weight.data[pad_idx] = torch.zeros(EMBEDDING_DIM)
            self.classifier.embedding.weight.data[unk_idx] = torch.zeros(EMBEDDING_DIM)
        self.optimizer = optim.Adam(self.classifier.parameters(), weight_decay=0.0001)
        self.criterion = nn.BCEWithLogitsLoss()
        self.criterion.to(DEVICE)


    def _initialize_fields(self):
        text_field = data.Field(sequential=True, use_vocab=True, lower=True, tokenize=self.tokenizer.tokenize, include_lengths=True)
        label_field = data.Field(sequential=False, use_vocab=False, dtype=torch.float)

        return [('text', text_field), ('label', label_field)]

    def _build_vocab(self, df):
        self._text_field = self.fields[0][1]
        self._label_field = self.fields[1][1]
        self._text_field.build_vocab(df, vectors=self.embedder, unk_init=torch.Tensor.normal_)
        self._label_field.build_vocab(df)
        print(f'text vocab size {len(self._text_field.vocab)}')
        print(f'label vocab size {len(self._label_field.vocab)}')
    
    def _save_text_field(self, path):
        torch.save(self._text_field, path)

    def _load_text_field(self, path):
        return torch.load(path, map_location=DEVICE)
    
    def _load_classifier(self, path):
        return self.classifier.load_state_dict(torch.load(path))

    def _initialize_embedder(self, embedder):
        vec = None
        try:
            vec = vocab.Vectors(embedder)
        except RuntimeError:
            print("No embedder found with name {}".format(embedder))
            if DEFAULT_MODEL == 'embed_tweets_de_300D_fasttext':
                url = 'http://4530.hostserv.eu/resources/embed_tweets_de_300D_fasttext.zip'
                download_path = os.path.join(self.base_path, 'embed_tweets_de_300D_fasttext.zip')
                wget.download(url, download_path)

                with ZipFile(download_path, 'r') as zipObj:
                    zipObj.extractall(self.base_path)
                vec = vocab.Vectors(DEFAULT_MODEL)
                print("Vec initialized")
        finally:
            return vec
    
    def _binary_accuracy(self, y_pred, y_true):
        rounded_preds = torch.round(torch.sigmoid(y_pred))
        correct = (rounded_preds == y_true).float()
        acc = correct.sum() / len(correct)
        return acc

    def _epoch_time(self, start_time, end_time):
        elapsed_time = end_time - start_time
        elapsed_mins = int(elapsed_time / 60)
        elapsed_secs = int(elapsed_time - (elapsed_mins * 60))
        return elapsed_mins, elapsed_secs

    def _train(self, iterator):
    
        epoch_loss = 0
        epoch_acc = 0
        
        self.classifier.train()
        
        for batch in iterator:
            
            self.optimizer.zero_grad()
            
            text, text_lengths = batch.text
            
            predictions = self.classifier(text, text_lengths).squeeze(1)
            
            loss = self.criterion(predictions, batch.label)
            
            acc = self._binary_accuracy(predictions, batch.label)
            
            loss.backward()
            
            self.optimizer.step()
            
            epoch_loss += loss.item()
            epoch_acc += acc.item()
            
        return epoch_loss / len(iterator), epoch_acc / len(iterator)

    def _evaluate(self, iterator, classifier=None):
    
        epoch_loss = 0
        epoch_acc = 0

        if classifier:
            self.classifier = classifier
        self.classifier.eval()
        
        with torch.no_grad():
        
            for batch in iterator:

                text, text_lengths = batch.text
                
                predictions = self.classifier(text, text_lengths).squeeze(1)
                
                loss = self.criterion(predictions, batch.label)
                
                acc = self._binary_accuracy(predictions, batch.label)

                epoch_loss += loss.item()
                epoch_acc += acc.item()
            
        return epoch_loss / len(iterator), epoch_acc / len(iterator)

    def run(self, epochs=10):
        train_bucket, val_bucket, test_bucket = data.BucketIterator.splits([self._train_df, self._val_df, self._test_full], batch_size=BATCH_SIZE, 
                                                      sort_key=lambda x: len(x.text),
                                                      sort_within_batch=True,
                                                      repeat=False, device=DEVICE)
        best_valid_loss = float('inf')

        for epoch in range(epochs):

            start_time = time.time()
            
            train_loss, train_acc = self._train(train_bucket)
            valid_loss, valid_acc =self._evaluate(val_bucket)
            
            end_time = time.time()

            epoch_mins, epoch_secs = self._epoch_time(start_time, end_time)
            
            if valid_loss < best_valid_loss:
                best_valid_loss = valid_loss
                best_model = self.classifier
                torch.save(self.classifier.state_dict(), os.path.join(self.base_path, 'germeval_classifier.pt'))
            
            print(f'Epoch: {epoch+1:02} | Epoch Time: {epoch_mins}m {epoch_secs}s')
            print(f'\tTrain Loss: {train_loss:.3f} | Train Acc: {train_acc*100:.2f}%')
            print(f'\t Val. Loss: {valid_loss:.3f} |  Val. Acc: {valid_acc*100:.2f}%')
        
        test_loss, test_acc = self._evaluate(test_bucket, best_model)
        print(f'Test Loss: {test_loss:.3f} | Test Acc: {test_acc*100:.2f}%')
    
    def predict(self, text):
        self.classifier.eval()
        tokenized = self.tokenizer.tokenize(text)
        indexed = [self._text_field.vocab.stoi[t] for t in tokenized]
        length = [len(indexed)]
        tensor = torch.LongTensor(indexed).to(DEVICE)
        tensor = tensor.unsqueeze(1)
        length_tensor = torch.LongTensor(length)
        prediction = torch.sigmoid(self.classifier(tensor, length_tensor))

        return round(prediction.item())

    def count_parameters(self, model):
        return sum(p.numel() for p in model.parameters() if p.requires_grad)



if __name__ == '__main__':
    germeval = TwitterClassifier()
    germeval.run(epochs=1)
    
    text_field_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'germ_eval_objects/germeval_text_field.pt')
    classifier_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'germ_eval_objects/germeval_classifier.pt')
    restore_from_paths = (text_field_path, classifier_path)
    if not os.path.isfile(text_field_path) and not os.path.isfile(classifier_path):
        os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'germ_eval_objects'), exist_ok=True)
        text_field_url = '' # TODO
        #gdown.download(text_field_url, text_field_path, quiet=False)
        classifier_url = '' # TODO
        #gdown.download(classifier_url, classifier_path, quiet=False)

    germeval = TwitterClassifier(restore_from_paths=restore_from_paths)
    s = '@monikabergholz2 Wir haben keine Meinungsfreiheit ,von wem soll die auch kommen wenn man eine in der DDR ausgebildete Bundeskanzlerin hat .Mielke hätte sich totgelacht.Ich glaube am Grab hört man in 🎉'
    print(germeval.predict(s))
    