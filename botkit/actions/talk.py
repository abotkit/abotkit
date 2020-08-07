import json
from random import choice
import os
from actions.Action import Action

class TalkAction(Action):
    name = "Talk"
    description = """
    Just answers predefined phrases
    """.strip()
    
    def __init__(self, settings={}):
        super().__init__(settings) 
        phrases = os.path.join(os.path.dirname(os.path.abspath( __file__ )), '..', 'phrases.json')
        with open(phrases) as f:
            self.answers = json.load(f)

    def execute(self, query, intent=None, data_collection={}):
        return choice(self.answers[intent])


def main():
    action = TalkAction()
    print(action.execute('hello, world', 'hello'))


if __name__ == '__main__':
    main()
