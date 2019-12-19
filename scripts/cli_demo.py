import sys
sys.path.append('..')

from persistence.bot_reader import BotReader
from persistence.server_writer import ServerWriter
from server.cli import CliServer

sys.path.append('..')


def start_cli():
    bot = BotReader('../bots/default.json').load()
    server = CliServer(bot)
    ServerWriter(server).write('../servers/cli.json')

    server.start()


if __name__ == '__main__':
    start_cli()
