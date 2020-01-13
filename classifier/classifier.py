"""
This namespace has the reference to all available classifiers
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from classifier.emotion import EmotionClassifier

CLASSIFIERS = {
    'emotion': EmotionClassifier,
}

if __name__ == '__main__':
    for classifier in CLASSIFIERS.values():
        print(f"Classifiers '{classifier.name}'")
        print(classifier.description)
