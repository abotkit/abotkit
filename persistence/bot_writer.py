# Writes current bot to a json file
import json


class BotWriter:
    def __init__(self, bot):
        self.bot = bot

    def _core(self):
        return {
            'name': self.bot.core.name,
            'intents': self.bot.core.intents,
        }

    def _actions(self):
        return [{
            'name': a.name,
            'settings': a.settings,
            'intent': intent,
        } for intent, a in self.bot.actions.items()]

    def data(self):
        return {
            'name': self.bot.name,
            'core': self._core(),
            'actions': self._actions(),
        }

    def write(self, file_name):
        with open(file_name, 'w') as f:
            json.dump(self.data(), f)
