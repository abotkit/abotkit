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
            'name': a['action'].name,
            'settings': a['action'].settings,
            'active': a['active'],
        } for a in self.bot.actions]

    def data(self):
        return {
            'name': self.bot.name,
            'core': self._core(),
            'actions': self._actions(),
        }

    def write(self, file_name):
        with open(file_name, 'w') as f:
            json.dump(self.data(), f)
