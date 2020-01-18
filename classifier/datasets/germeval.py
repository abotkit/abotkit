

import wget
import os
from torchtext import data
import pandas as pd


class GermEvalDataset:
    def __init__(self, path=os.path.dirname(os.path.abspath(__file__)), restore_samples=False):
        self.base_path = os.path.join(path, 'germ_eval_dataset')
        self.restore_samples = restore_samples
        self._download_data()

    def _download_data(self):
        if self.restore_samples:
            pass
        else:
            os.makedirs(self.base_path, exist_ok=True)
            train_url = "https://raw.githubusercontent.com/uds-lsv/GermEval-2018-Data/master/germeval2018.training.txt"
            self._download_path_train = os.path.join(self.base_path, 'germeval_training.txt')
            wget.download(train_url, self._download_path_train)

            test_url = "https://raw.githubusercontent.com/uds-lsv/GermEval-2018-Data/master/germeval2018.test.txt"
            self._download_path_test = os.path.join(self.base_path, 'germ_eval_test.txt')
            wget.download(test_url, self._download_path_test) 
    
    def _read_data(self, path):
        df = pd.read_csv(path, header=None, 
                   names=["text", "label", "multiclass_target"], sep="\t")
        df['label'] = df['label'].map({'OTHER': 0, 'OFFENSE': 1})
        df.drop(['multiclass_target'], axis=1, inplace=True)

        return df

    def get_data(self):
        train_df = self._read_data(self._download_path_train)
        test_df = self._read_data(self._download_path_test)

        return (train_df, test_df)

class DataframeDataset(data.Dataset):
    def __init__(self, df, fields, **kwargs):
        examples = []
        for _, row in df.iterrows():
            values = [row[f[0]] for f in fields]
            example = data.Example.fromlist(values, fields)
            if len(example.text) > 0:
              examples.append(example)

        super().__init__(examples, fields, **kwargs)

    @staticmethod
    def sort_key(ex): return len(ex.text)

    @classmethod
    def splits(cls, fields, df_trn, df_val=None, df_test=None, **kwargs):
        trn_data, val_data, tst_data = (None, None, None)

        if df_trn is not None:
            trn_data = cls(df_trn.copy(), fields, **kwargs)
        if df_val is not None:
            val_data = cls(df_val.copy(), fields, **kwargs)
        if df_test is not None:
            tst_data = cls(df_test.copy(), fields, **kwargs)

        result = tuple(d for d in (
            trn_data, val_data, tst_data) if d is not None)
        # similar to the torchtext version, return a scalar if only 1 element
        return result if len(result) > 1 else result[0]

if __name__ == '__main__':
    germeval_dataset = GermEvalDataset()




