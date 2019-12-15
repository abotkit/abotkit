"""
This namespace has the reference to all available actions
"""
from actions.shout import ShoutAction
from actions.hackernews import HNAction
from actions.openweather import OpenWeatherAction

ACTION_DICT = {
    'shout': ShoutAction,
    'hackernews': HNAction,
    'openweather': OpenWeatherAction,
}

ACTIONS = list(ACTION_DICT.values())

if __name__ == '__main__':
    for action in ACTIONS:
        print(f"Action '{action.name}'")
        print(action.description)
        print(f"Settings: {action.settings}")
