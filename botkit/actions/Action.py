class Action:
    name='base action'
    description='base description'
    settings={}

    def __init__(self, settings={}):
        self.settings = settings

    def execute(self, query, intent=None, data_collection={}):
        pass