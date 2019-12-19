from data_collection.data_collection import COLLECTORS
from actions.actions import ACTIONS


class Bot:
    def __init__(self, core, name='<no name>'):
        self.name = name
        self.core = core
        self.actions = [{
            'action': a(),
            'active': False,
        } for a in ACTIONS]

    def _find_action_by_name(self, action_name):
        return next(a for a in self.actions if a['action'].name == action_name)

    def _find_action_by_intent(self, intent):
        return next(
            a for a in self.actions
            if a['active'] is not False and a['active']['intent'] == intent)

    def add_action(self, intent, action):
        self._find_action_by_name(action.name)['active'] = {'intent': intent}

    def delete_action(self, intent):
        self._find_action_by_intent(intent)['active'] = False

    def explain(self, query):
        explanation = {'query': query}

        result = self.core.intent_of(query)
        explanation = {**explanation, **result}

        intent = result['intent']
        if intent is None:
            return explanation

        action = self._find_action_by_intent(intent)['action']

        if action is not None:
            explanation['action'] = {
                'name': action.name,
                'description': action.description,
                'settings': action.settings,
                'data_collection': self.__data_collection(query),
            }

        return explanation

    def __data_collection(self, query):
        collected = {}

        for c in COLLECTORS:
            collected.update(c.extract(query))

        return collected

    def handle(self, query):
        result = self.core.intent_of(query)
        intent = result['intent']

        if intent is None:
            raise Exception('No intent detected')

        action = self._find_action_by_intent(intent)['action']
        print(action)

        if action is None:
            raise Exception('No action found')

        data_collection = self.__data_collection(query)
        return action.execute(query, data_collection=data_collection)


def main():
    from core.transformer import TransformerCore
    from actions.shout import ShoutAction

    core = TransformerCore()
    core.add_intent('hello, world', 'shout')

    bot = Bot(core)
    bot.add_action('shout', ShoutAction())

    print(bot.handle('hi, world'))
    print(bot.explain('hi, world'))

    # Output
    # > HI, WORLD
    # > {'query': 'hi, world',
    #    'score': 0.7879715894248445,
    #    'intent': 'shout',
    #    'action': {
    #     'name': 'Shout',
    #     'description': 'A simple shout action. Used as an example',
    #     'settings': {}
    #   }}


if __name__ == '__main__':
    main()
