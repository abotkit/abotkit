from actions.Action import Action

class ReverseAction(Action):
    name = "Reverse"
    description = """
    A simple reverse talk action. Used as an example
    """.strip()

    def __init__(self, settings={}):
        super().__init__(settings) 

    def execute(self, query, intent=None, data_collection={}):
        query = query[::-1]
        return query


def main():
    action = ReverseAction()
    print(action.execute('hello, world'))


if __name__ == '__main__':
    main()
