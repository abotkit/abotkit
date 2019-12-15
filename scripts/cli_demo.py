import sys
sys.path.append('..')

from actions.actions import ACTIONS
from persistence.bot_reader import BotReader
from server.cli import CliServer


def start_cli():
    bot = BotReader('../bots/default.json').load()
    server = CliServer(bot)

    server.start()


if __name__ == '__main__':
    start_cli()
