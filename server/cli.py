class CliServer:
    name = "CLI"

    def __init__(self, bot, settings={}):
        self.bot = bot
        self.settings = settings

    def say(self, message):
        print(f"Bot says: {message}")

    def start(self):
        while True:
            query = input('Enter your query: ')
            try:
                res = self.bot.handle(query)
                self.say(res)
            except Exception as e:
                print(f"Error happened: {e}")
                print(self.bot.explain(query))
