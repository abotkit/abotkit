# Writes current bot to a json file
import json


class ServerWriter:
    def __init__(self, server):
        self.server = server

    def data(self):
        return {
            'name': self.server.name,
            'settings': self.server.settings,
        }

    def write(self, file_name):
        with open(file_name, 'w') as f:
            json.dump(self.data(), f)
