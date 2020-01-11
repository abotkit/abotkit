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

DEFAULT_MODEL = 'roberta-base-nli-stsb-mean-tokens'

class Classifier(nn.Module):
    def __init__(self):
        super(Classifier, self).__init__()
        self.dense1 = nn.Linear(768, 2048)
        self.dense2 = nn.Linear(2048, 4096)
        self.dense3 = nn.Linear(4096, 1)

    def forward(self, x):
        x = F.leaky_relu(self.dense1(x))
        x = F.leaky_relu(self.dense2(x))
        x = torch.sigmoid(self.dense3(x))
        return x    


class EmotionClassifier:
    name = 'Emotion Classifier'
    description = "This classifier detects positive or negative sentiment in input texts"

    def __init__(self, embedder=DEFAULT_MODEL):
        print(f"Loading model {embedder}")
        self.embedder = SentenceTransformer(embedder)
        self.classifier = Classifier()
        self.criterion = nn.BCELoss()
        self.optimizer = optim.SGD(self.classifier.parameters(), lr=0.001, momentum=0.9)

        dataset = MovieReviewDataset(transform=[
            lambda x: torch.tensor(self.embedder.encode([x])),
            lambda x: torch.tensor(x, dtype=torch.float)
        ])
        self.train_dataset, self.test_dataset = random_split(dataset, [math.ceil(len(dataset)*0.8), math.floor(len(dataset)*0.2)])
        
        self.train_dataloader = DataLoader(self.train_dataset, batch_size=32, shuffle=True, num_workers=2)
        self.test_dataloader = DataLoader(self.test_dataset, batch_size=32, shuffle=True, num_workers=2)

    def predict(self, sentence):
        self.embedder.encode([sentence])
        print('NOT IMPLEMENTED YET')
        # use mlp (see train method)

    def log(self, message, verbose):
        if verbose > 0:
            print(message)

    def train(self, epochs=10, output_per_step=None, verbose=0):
        running_loss = 0
        self.log('Start training', verbose)
        for epoch in range(epochs):
            self.log('Start epoch {}'.format(epoch), verbose)

            if verbose > 0:
                batches = tqdm(self.train_dataloader)
            else:
                batches = self.train_dataloader

            for i, batch in enumerate(batches):
                inputs, labels = batch
                self.optimizer.zero_grad()

                outputs = self.classifier(inputs)
                loss = self.criterion(outputs.squeeze(), labels)
                loss.backward()
                self.optimizer.step()

                running_loss += loss.item()
                if output_per_step:
                    if i % 0 == output_per_step:
                        print('[{}, {}] loss: {}'.format(epoch + 1, i + 1, running_loss / output_per_step))
                        running_loss = 0.0


if __name__ == '__main__':
    classifier = EmotionClassifier()
    #sentence = input('Type a positve or negative sentence and press enter: ')
    #classifier.predict(sentence)
    classifier.train(verbose=1)
