from sentence_transformers import SentenceTransformer
import scipy.spatial

DEFAULT_MODEL = 'roberta-base-nli-stsb-mean-tokens'

class EmotionClassifier:
    name = 'Emotion Classifier'
    description = "This classifier detects positive or negative sentiment in input texts"

    def __init__(self, model=DEFAULT_MODEL):
        print(f"Loading model {model}")
        self.embedder = SentenceTransformer(model)

    def predict(self, sentence):
        self.embedder.encode([sentence])
        print('NOT IMPLEMENTED YET')
        # use mlp (see train method)

    def train(self, data):
        print('NOT IMPLEMENTED YET')
        # divide data (sentences + labels -> positive/negative) into test and train
        # encode sentences
        # train mlp input: encoding output -> sigmoid (positive/negative)


if __name__ == '__main__':
    classifier = EmotionClassifier()
    sentence = input('Type a positve or negative sentence and press enter: ')
    classifier.predict(sentence)
