# Write + load a server
import sys
sys.path.append('..')

from persistence.server_writer import ServerWriter
from persistence.server_reader import ServerReader
from persistence.bot_reader import BotReader

from server.slack import SlackServer

bot = BotReader('../bots/default.json').load()


def write():
    server = SlackServer(bot, settings={'slack_token': 'my-token'})
    ServerWriter(server).write('../servers/slack.json')


def load():
    server = ServerReader('../servers/slack.json').load(bot)
    server.start()


if __name__ == '__main__':
    write()
    load()
