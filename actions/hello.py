from random import choice

GREETINGS = [
    "Hello, world!",
    "Hello, friend. Hello, friend.",
    "Howdy",
    "You're in a dream. You're in my dream.",
    "What's up",
    "Yo",
    "Hello mister",
    "Doctor.",
    "How you doin?",
]


class HelloAction:
    name = "Hello"

    description = """
    Greets the user
    """.strip()

    # Has no settings
    settings = {}

    def __init__(self, settings=settings):
        pass

    def execute(self, query, data_collection={}):
        return choice(GREETINGS)


def main():
    action = HelloAction()
    print(action.execute('hello, world'))


if __name__ == '__main__':
    main()
