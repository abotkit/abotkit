# Reads a bot from a json file
import json
from core.core import CORE_DICT
from actions.actions import ACTION_DICT
from bot import Bot


class BotReader:
    def __init__(self, file_name):
        self.file_name = file_name

    def _read_file(self):
        with open(self.file_name) as f:
            data = json.load(f)
            self.name = data['name']
            self.core = data['core']
            self.actions = data['actions']

    def _core(self):
        core = CORE_DICT[self.core['name']]()
        core.load_intents(self.core['intents'])

        return core

    def _add_actions(self):
        for a in self.actions:
            action = ACTION_DICT[a['name']]

            if a['active'] is not False:
                self.bot.add_action(a['active']['intent'],
                                    action(settings=a['settings']))

    def load(self):
        self._read_file()
        self.bot = Bot(self._core(), name=self.name)
        self._add_actions()

        return self.bot
