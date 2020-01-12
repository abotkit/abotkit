from sentence_transformers import SentenceTransformer
from torch.utils.data import DataLoader, random_split
import torch.optim as optim
import torch.nn as nn
import torch.nn.functional as F
import scipy.spatial
from datasets.movie_review import MovieReviewDataset
import math
import torch
from tqdm import tqdm
import wget
import os

DEFAULT_MODEL = 'roberta-large-nli-stsb-mean-tokens'

class Classifier(nn.Module):
    def __init__(self):
        super(Classifier, self).__init__()
        self.linear1 = nn.Linear(1024, 2048)
        self.linear2 = nn.Linear(2048, 2048)
        self.linear3 = nn.Linear(2048, 512)
        self.linear4 = nn.Linear(512, 1)
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = F.elu(self.linear1(x))
        x = self.dropout(x)
        x = F.elu(self.linear2(x))
        x = self.dropout(x)
        x = F.elu(self.linear3(x))
        x = self.dropout(x)
        x = torch.sigmoid(self.linear4(x))
        return x


class EmotionClassifier:
    name = 'Emotion Classifier'
    description = "This classifier detects positive or negative sentiment in input texts"

    def __init__(self, embedder=DEFAULT_MODEL, restore_from_path=None, transformed_samples_path=None):
        self.embedder = SentenceTransformer(embedder)
        self.classifier = Classifier()
        self.criterion = nn.BCELoss()
        self.optimizer = optim.SGD(self.classifier.parameters(), lr=0.001)
        self.transformed_samples_path = transformed_samples_path

        if torch.cuda.is_available():
            self.classifier.cuda()

        if restore_from_path:
            self.load(restore_from_path)

    def predict(self, text):
        text = text.replace('\n', '')
        sentences = text.split('.')
        data = []
        for sentence in sentences:
            data.append(self.embedder.encode([sentence]))
            
        data = torch.mean(torch.tensor(data), 0).flatten()

        self.classifier.eval()
        with torch.no_grad():
            prediction = self.classifier(data)

        return torch.round(prediction.squeeze()).item()

    def log(self, message, verbose):
        if verbose > 0:
            print(message)

    def save(self, path):
        torch.save(self.classifier.state_dict(), path)

    def load(self, path):
        if torch.cuda.is_available():
            self.classifier.load_state_dict(torch.load(path))
        else:
            device = torch.device('cpu')
            self.classifier.load_state_dict(torch.load(path, map_location=device))
        self.classifier.eval()

    def train(self, epochs=10, output_per_step=None, verbose=0):
        if not self.train_dataset:
            dataset = MovieReviewDataset(transform=[
                lambda x: embedder.encode([x]),
                lambda x: torch.tensor(x),
                lambda x: torch.tensor(x, dtype=torch.float)
            ], restore_transformed_samples=self.transformed_samples_path)
            self.train_dataset, self.test_dataset = random_split(dataset, [math.ceil(len(dataset)*0.8), math.floor(len(dataset)*0.2)])
            
            self.train_dataloader = DataLoader(self.train_dataset, batch_size=32, shuffle=True, num_workers=2)
            self.test_dataloader = DataLoader(self.test_dataset, batch_size=32, shuffle=True, num_workers=2)
        
        running_loss = 0
        self.log('Start training', verbose)
        for epoch in range(epochs):
            self.log('Start epoch {}'.format(epoch), verbose)

            for i, batch in enumerate(self.train_dataloader):
                self.classifier.train()
                inputs, labels, _ = batch

                if torch.cuda.is_available():
                    inputs = inputs.cuda()
                    labels = labels.cuda()

                self.optimizer.zero_grad()

                outputs = self.classifier(inputs)
                loss = self.criterion(outputs.squeeze(), labels)
                loss.backward()
                self.optimizer.step()

                running_loss += loss.item()
                if output_per_step:
                    if i % output_per_step == output_per_step - 1:
                        print('[Epoch {}] loss: {}'.format(epoch + 1, running_loss / output_per_step))
                        running_loss = 0.0
                        correct_predictions = 0
                        predictions = 0
                        false_positives = 0
                        false_negatives = 0
                        true_positives = 0
                        true_negatives = 0
                        with torch.no_grad():
                            self.classifier.eval()
                            for test_batch in self.test_dataloader:
                                test_inputs, test_labels, test_text = test_batch

                                if torch.cuda.is_available():
                                    test_inputs = test_inputs.cuda()
                                    test_labels = test_labels.cuda()

                                test_outputs = self.classifier(test_inputs)
                                prediction = torch.round(test_outputs.squeeze())
                                correct_predictions += torch.sum(prediction == test_labels).item()
                                predictions += (prediction == test_labels).nelement()
          
                                false_positives += torch.sum((prediction - test_labels) == torch.ones_like(prediction)).item()
                                false_negatives += torch.sum((prediction - test_labels) == (torch.ones_like(prediction) * -1)).item()
                                true_positives += torch.sum((prediction + test_labels) == (torch.ones_like(prediction) * 2)).item()
                                true_negatives += torch.sum((prediction + test_labels) == torch.zeros_like(prediction)).item()
                        print('[Epoch {}] Accuracy: {}, FP: {} FN: {} TP: {} TN: {} Total: {}'.format(epoch + 1, 
                            (correct_predictions/predictions) * 100, false_positives, false_negatives, true_positives, true_negatives, predictions))

                                
if __name__ == '__main__':
    download_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'emotion_classifier.pt')
    if not os.path.isfile(download_path):
        wget.download('https://drive.google.com/file/d/1-wUMI9xNsODvSetQpJqZnH9oMMhno91G/view?usp=sharing', download_path)
    
    classifier = EmotionClassifier(restore_from_path=download_path)
    text = input('Type a positve or negative text and press enter: ')
    
    is_positive = classifier.predict(text)
    if is_positive:
        print('Your text was classified as positive')
    else:
        print('Your text was classified as negative')
