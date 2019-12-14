class CliServer:
    def __init__(self, bot, output):
        self.bot = bot
        self.output = output

    def start(self):
        while True:
            query = input('Enter your query: ')
            try:
                res = self.bot.handle(query)
                self.output.say(res)
            except Exception as e:
                print(f"Error happened: {e}")
                print(self.bot.explain(query))
