"""
This namespace has the reference to all available actions
"""
from actions.shout import ShoutAction
from actions.hackernews import HNAction
from actions.openweather import OpenWeatherAction

ACTIONS = [ShoutAction, HNAction, OpenWeatherAction]
ACTION_DICT = {a.name: a for a in ACTIONS}

if __name__ == '__main__':
    for action in ACTIONS:
        print(f"Action '{action.name}'")
        print(action.description)
        print(f"Settings: {action.settings}")
