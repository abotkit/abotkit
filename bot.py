class Bot:
    def __init__(self, core):
        self.core = core
        self.actions = {}

    def add_action(self, keyword, action):
        self.actions[keyword] = action

    def explain(self, query):
        explanation = {'query': query}

        result = self.core.intent_of(query)
        explanation = {**explanation, **result}

        intent = result['intent']
        if intent is None:
            return explanation

        action = self.actions[intent]

        if action is not None:
            explanation['action'] = {
                'name': action.name,
                'description': action.description,
                'settings': action.settings,
            }

        return explanation

    def handle(self, query):
        result = self.core.intent_of(query)
        intent = result['intent']

        if intent is None:
            raise 'No intent detected'

        action = self.actions[intent]

        if action is None:
            raise 'No action found'

        return action.execute(query)


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
