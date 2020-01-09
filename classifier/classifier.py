"""
This namespace has the reference to all available classifiers
"""
from classifier.emotion import EmotionClassifier

CLASSIFIERS = [
    EmotionClassifier,
]

if __name__ == '__main__':
    for classifier in CLASSIFIERS:
        print(f"Classifiers '{classifier.name}'")
        print(classifier.description)
