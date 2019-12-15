# A simple weather bot setup
import sys
sys.path.append('..')

from actions.actions import ACTIONS
from bot import Bot
from core.transformer import TransformerCore
from server.slack import SlackServer

settings = {
    'appid': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'slack_token': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
}


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
    bot.add_action('weather', weather_action(settings=settings))

    server = SlackServer(bot, settings=settings)
    server.start()


if __name__ == '__main__':
    start_cli()
