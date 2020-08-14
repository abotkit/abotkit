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
        phrases = os.path.join(os.path.dirname(os.path.abspath( __file__ )), 'phrases.json')
        with open(phrases) as handle:
            self.answers = json.load(handle)

    def execute(self, query, intent=None, data_collection={}):
        if intent in self.answers:
            return choice(self.answers[intent])
        else:
            return 'Doesn\'t look like anything to me'


def main():
    action = TalkAction()
    print(action.execute('hello, world', 'hello'))


if __name__ == '__main__':
    main()
