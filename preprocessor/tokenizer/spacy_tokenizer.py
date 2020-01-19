
"""

Download the model for tokenization:
python -m spacy de_core_news_md
"""

import re
import string

import spacy
from spacy.lang.de.stop_words import STOP_WORDS

DEFAULT_MODEL = 'de_core_news_md'


class SpacyTokenizer:
    name = 'Spacy Tokenizer'
    description = 'This tokenizer uses a spacy model to tokenize text'

    def __init__(self, tokenizer=DEFAULT_MODEL):
        self.tokenizer = spacy.load(tokenizer)
        self.punctuations = self._initialize_punctuations()

    def _initialize_punctuations(self):
        punctuations = string.punctuation
        special_punctuations = ['’', '–', '‘', '‚', '“', '”', '„', '†', '…', 
                                '…', '‼️', '⁉️']
        for i in special_punctuations:
            punctuations += i
        
        return punctuations

    def tokenize(self, text):
        space_pattern = '\s+'
        url_pattern = ('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|''[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        mention_pattern = '@[\w\-]+'
        
        parsed_text = re.sub(space_pattern, ' ', text)
        parsed_text = re.sub(url_pattern, '', parsed_text)
        parsed_text = re.sub(mention_pattern, '', parsed_text)
        parsed_text = parsed_text.strip().lower()
        tokens = self.tokenizer(parsed_text)
        tokens = [word.lemma_.lower().strip() if word.lemma_ != "-PRON-" else word.lower_ for word in tokens]
        tokens = [word for word in tokens if word not in STOP_WORDS and word not in self.punctuations]
        
        return tokens

