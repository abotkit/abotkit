import sys
sys.path.append('..')

from actions.actions import ACTIONS
from bot import Bot
from core.transformer import TransformerCore
from output.cli import Cli
from server.cli import CliServer


def start_cli():
    core = TransformerCore()
    bot = Bot(core)

    # We need one intent and one action
    core.add_intent('Hello, world', 'shout')
    bot.add_action('shout', ACTIONS[0]())

    output = Cli()
    server = CliServer(bot, output)

    server.start()


if __name__ == '__main__':
    start_cli()
