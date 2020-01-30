"""
This namespace has the reference to all available tokenizers
"""

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from tokenizer.bert_tokenizer import GermanBertTokenizer


TOKENIZERS = {
    'bert_tokenizer': GermanBertTokenizer
}

if __name__ == '__main__':
    for tokenizer in TOKENIZERS.values():
        print(f"Tokenizer '{tokenizer.name}'")
        print(tokenizer.description)
        s = '@martin Das ist ein Beispieltext!!!'
        # init tokenizer
        tokenizer_object = tokenizer()
        print(tokenizer_object.tokenize(s))
