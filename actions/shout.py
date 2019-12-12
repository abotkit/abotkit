class ShoutAction:
    description = """
    A simple shout action. Used as an example
    """

    # Has no settings
    settings = {}

    def execute(self, query, data_collection={}):
        return query.upper()


def main():
    action = ShoutAction()
    print(action.execute('hello, world'))


if __name__ == '__main__':
    main()
