import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import time

import numpy as np
import random
from zipfile import ZipFile
import wget

import torch
import torch.nn as nn
from torchtext import data, vocab
import torch.optim as optim

from .tokenizer.tokenizer import TOKENIZERS
from .datasets.germeval import GermEvalDataset, DataframeDataset


SEED = 1234
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.backends.cudnn.deterministic = True

HIDDEN_DIM = 256
OUTPUT_DIM = 1
N_LAYERS = 2
BIDIRECTIONAL = True
DROPOUT = 0.25

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


class Classifier(nn.Module):
    def __init__(self, bert, hidden_dim, output_dim, n_layers, bidirectional, dropout):
        super().__init__()
        
        self.bert = bert
        
        embedding_dim = bert.config.to_dict()['hidden_size']
        
        self.rnn = nn.GRU(embedding_dim,
                          hidden_dim,
                          num_layers = n_layers,
                          bidirectional = bidirectional,
                          batch_first = True,
                          dropout = 0 if n_layers < 2 else dropout)
        
        self.out = nn.Linear(hidden_dim * 2 if bidirectional else hidden_dim, output_dim)
        
        self.dropout = nn.Dropout(dropout)

    def forward(self, text):
        
        #text = [batch size, sent len]
                
        with torch.no_grad():
            embedded = self.bert(text)[0]
                
        #embedded = [batch size, sent len, emb dim]
        
        _, hidden = self.rnn(embedded)
        
        #hidden = [n layers * n directions, batch size, emb dim]
        
        if self.rnn.bidirectional:
            hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim = 1))
        else:
            hidden = self.dropout(hidden[-1,:,:])
                
        #hidden = [batch size, hid dim]
        
        output = self.out(hidden)
        
        #output = [batch size, out dim]
        
        return output


class Offensive:
    name = 'Offensive Bert Classifier'
    description = 'This is a classifier for german tweets to classify offensive vs. other, trained on data from germeval 2018 challenge'
    
    def __init__(self, tokenizer='bert_tokenizer', restore_from_path=None):
        self.tokenizer = TOKENIZERS[tokenizer]()
        self.classifier = Classifier(
            self.tokenizer.bert_model, 
            HIDDEN_DIM, 
            OUTPUT_DIM, 
            N_LAYERS, 
            BIDIRECTIONAL,
            DROPOUT)

        if torch.cuda.is_available():
            self.classifier.cuda()

        if restore_from_path:
            self.load(restore_from_path)

    def load(self, path):
        self.classifier.load_state_dict(torch.load(path, map_location=DEVICE))
        self.classifier.eval()

    def train(self):
        # TODO
        return

    def evaluate(self):
        # TODO
        return

    def run(self):
        # TODO
        return

    def predict(self, text):
        tokens = self.tokenizer.tokenize(text)
        tokens = tokens[:self.tokenizer.max_input_length-2]
        indexed = [self.tokenizer.tokenizer.cls_token_id] + self.tokenizer.tokenizer.convert_tokens_to_ids(tokens) + [self.tokenizer.tokenizer.sep_token_id]
        tensor = torch.LongTensor(indexed).to(DEVICE)
        tensor = tensor.unsqueeze(0)
        prediction = torch.sigmoid(self.classifier(tensor))

        return round(prediction.item())



if __name__ == '__main__':
    of = Offensive()
    s = "@martin Das ist ein Beispieltext!!"
    print(of.tokenizer.tokenize(s))