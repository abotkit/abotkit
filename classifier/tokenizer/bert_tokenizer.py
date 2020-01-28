# -*- coding: utf-8 -*-
"""
Created on Tue Jan 28 20:38:30 2020

@author: nikla_000
"""
import re

from transformers import BertTokenizer, BertModel

DEFAULT_MODEL = 'bert-base-german-dbmdz-cased'


class GermanBertTokenizer:
    name = 'Bert tokenizer'
    description = 'This tokenizer uses the {} bert model to tokenize text'.format(DEFAULT_MODEL)

    def __init__(self, tokenizer=DEFAULT_MODEL):
        self.tokenizer = BertTokenizer.from_pretrained(tokenizer)
        self.bert_model = BertModel.from_pretrained(tokenizer)
        self.max_input_length = self.tokenizer.max_model_input_sizes[tokenizer]

    def tokenize(self, sentence):
        space_pattern = '\s+'
        url_pattern = ('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|'
        '[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        mention_pattern = '@[\w\-]+'
        
        parsed_text = re.sub(space_pattern, ' ', sentence)
        parsed_text = re.sub(url_pattern, '', parsed_text)
        parsed_text = re.sub(mention_pattern, '', parsed_text)
        parsed_text = parsed_text.strip().lower()
        tokens = self.tokenizer.tokenize(parsed_text) 
        tokens = tokens[:self.max_input_length-2]
        return tokens

if __name__ == '__main__':
    tokenizer = GermanBertTokenizer()
    s = '@martin das ist ein Beispieltext verdammt nochmal!!!'
    print(tokenizer.tokenize(s))



