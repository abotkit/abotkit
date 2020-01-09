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

class MovieReviewDataset(Dataset):
    def __init__(self, path=os.path.dirname(os.path.abspath(__file__))):
        url = 'https://www.cs.cornell.edu/people/pabo/movie-review-data/review_polarity.tar.gz'
        self.base_path = os.path.join(path, 'movie_review_dataset')
        download_path = os.path.join(self.base_path, 'review_polarity.tar.gz')

        if not os.path.isdir(self.base_path):
            os.makedirs(self.base_path)
            wget.download(url, download_path)

        if os.path.isfile(download_path):
            with tarfile.open(download_path, 'r:gz') as tar:
                tar.extractall(self.base_path)
            os.unlink(download_path)

        self.samples = []
        for negative_sample in os.listdir(os.path.join(self.base_path, 'txt_sentoken', 'neg')):
            with open(os.path.join(self.base_path, 'txt_sentoken', 'neg', negative_sample)) as file:
                text = file.read()
                self.samples.append((text.replace('\n', ''), 0))

        for positive_sample in os.listdir(os.path.join(self.base_path, 'txt_sentoken', 'pos')):
            with open(os.path.join(self.base_path, 'txt_sentoken', 'pos', positive_sample)) as file:
                text = file.read()
                self.samples.append((text.replace('\n', ''), 1))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        return self.samples[index]
        

if __name__ == '__main__':
    movieReviewDataset = MovieReviewDataset()
    print(movieReviewDataset[0])

        