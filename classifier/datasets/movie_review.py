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
    def __init__(self, path=os.path.dirname(os.path.abspath(__file__)), transform=None, restore_transformed_samples=None):
        self.base_path = os.path.join(path, 'movie_review_dataset')
        self.transform = transform
        if restore_transformed_samples:
            with open(restore_transformed_samples, 'rb') as file:
                self.samples = pickle.load(file)
        else:
            url = 'https://www.cs.cornell.edu/people/pabo/movie-review-data/review_polarity.tar.gz'
            download_path = os.path.join(self.base_path, 'review_polarity.tar.gz')

            if not os.path.isdir(self.base_path):
                os.makedirs(self.base_path)
                wget.download(url, download_path)

            if os.path.isfile(download_path):
                with tarfile.open(download_path, 'r:gz') as tar:
                    tar.extractall(self.base_path)
                os.unlink(download_path)

            self.samples = []
            self.preprocess('positive')
            self.preprocess('negative')

    def store_transformed_samples(self, path):
        with open(path, 'wb') as file:
            pickle.dump(self.samples, file)

    def preprocess(self, usage):
        print('Read {} samples'.format(usage))
        for i, sample in enumerate(tqdm(os.listdir(os.path.join(self.base_path, 'txt_sentoken', usage[:3])))):
            with open(os.path.join(self.base_path, 'txt_sentoken', usage[:3], sample)) as file:
                text = file.read()
                text = text.replace('\n', '')
                label = np.array(usage == 'positive', dtype=np.int32)
                if self.transform:
                    sentences = text.split('.')
                    data = []
                    for sentence in sentences:
                        data.append(self.transform[0](sentence))
                      
                    data = torch.mean(self.transform[1](data), 0).flatten()
                    label = self.transform[2](label)
                    self.samples.append((data, label, text))
                else:
                    self.samples.append((text, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        return self.samples[index]
        

if __name__ == '__main__':
    movieReviewDataset = MovieReviewDataset()
    print(movieReviewDataset[0])

        