# A simple weather bot setup
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
    core.add_intent('How is the weather in London?', 'weather')
    core.add_intent('Is it raining tomorrow?', 'weather')
    core.add_intent('What\'s the temperature?', 'weather')
    core.add_intent('Tell me the weather', 'weather')
    core.add_intent('Will we have a white christmas?', 'weather')

    weather_action = next(a for a in ACTIONS if a.name == 'Weather')
    settings = {'appid': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
    bot.add_action('weather', weather_action(settings=settings))

    output = Cli()
    server = CliServer(bot, output)

    server.start()


if __name__ == '__main__':
    start_cli()
