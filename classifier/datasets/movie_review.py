'''
    This file will download the following dataset:
        http://www.cs.cornell.edu/people/pabo/movie-review-data


        The data was first used in Bo Pang and Lillian Lee,
        ``A Sentimental Education: Sentiment Analysis Using Subjectivity Summarization 
        Based on Minimum Cuts'',  Proceedings of the ACL, 2004.
'''

import wget
import os
import tarfile
from torch.utils.data import Dataset
from tqdm import tqdm
import numpy as np

class MovieReviewDataset(Dataset):
    def __init__(self, path=os.path.dirname(os.path.abspath(__file__)), transform=None):
        url = 'https://www.cs.cornell.edu/people/pabo/movie-review-data/review_polarity.tar.gz'
        self.base_path = os.path.join(path, 'movie_review_dataset')
        self.transform = transform
        download_path = os.path.join(self.base_path, 'review_polarity.tar.gz')

        if not os.path.isdir(self.base_path):
            os.makedirs(self.base_path)
            wget.download(url, download_path)

        if os.path.isfile(download_path):
            with tarfile.open(download_path, 'r:gz') as tar:
                tar.extractall(self.base_path)
            os.unlink(download_path)

        self.samples = []
        print('Read negative samples')
        for i, negative_sample in enumerate(tqdm(os.listdir(os.path.join(self.base_path, 'txt_sentoken', 'neg')))):
            with open(os.path.join(self.base_path, 'txt_sentoken', 'neg', negative_sample)) as file:
                text = file.read()
                text = text.replace('\n', '')
                label = np.array(0)
                if self.transform:
                    text = self.transform[0](text)
                    label = self.transform[1](label)

                self.samples.append((text, label))

        print('Read positive samples')
        for i,positive_sample in enumerate(tqdm(os.listdir(os.path.join(self.base_path, 'txt_sentoken', 'pos')))):
            with open(os.path.join(self.base_path, 'txt_sentoken', 'pos', positive_sample)) as file:
                text = file.read()
                text = text.replace('\n', '')
                label = np.array(1)
                if self.transform:
                    text = self.transform[0](text)
                    label = self.transform[1](label)

                self.samples.append((text, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        return self.samples[index]
        

if __name__ == '__main__':
    movieReviewDataset = MovieReviewDataset()
    print(movieReviewDataset[0])

        