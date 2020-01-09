from sentence_transformers import SentenceTransformer
import scipy.spatial

DEFAULT_MODEL = 'roberta-base-nli-stsb-mean-tokens'

class EmotionClassifier:
    def __init__(self, model=DEFAULT_MODEL):
        print(f"Loading model {model}")
        self.embedder = SentenceTransformer(model)

    def predict(self, sentence):
        self.embedder.encode([sentence])
        # use mlp (see train method)

    def train(self, data):
        # divide data (sentences + labels -> positive/negative) into test and train
        # encode sentences
        # train mlp input: encoding output -> sigmoid (positive/negative)

if __name__ == '__main__':
    classifier = EmotionClassifier()
    sentence = input('Type a positve or negative sentence and press enter: ')
    classifier.predict(sentence)
