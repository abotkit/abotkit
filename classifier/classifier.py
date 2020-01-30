"""
This namespace has the reference to all available classifiers
"""
import os
import sys
from .emotion import EmotionClassifier
from .offensive import Offensive

CLASSIFIERS = {
    'emotion': EmotionClassifier,
    'offensive': Offensive
}

if __name__ == '__main__':
    for classifier in CLASSIFIERS.values():
        print(f"Classifiers '{classifier.name}'")
        print(classifier.description)
