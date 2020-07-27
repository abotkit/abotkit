# Reads a server from a json file
import json
from server.server import SERVER_DICT


class ServerReader:
    def __init__(self, file_name):
        self.file_name = file_name

    def _read_file(self):
        with open(self.file_name) as f:
            self.data = json.load(f)

    def load(self, bot):
        self._read_file()
        server = SERVER_DICT[self.data['name']]

        return server(bot, settings=self.data['settings'])
