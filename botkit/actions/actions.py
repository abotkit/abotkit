"""
This namespace has the reference to all available actions
"""
from .mail import SendMailAction
from .shout import ShoutAction
from .hello import HelloAction
from .hackernews import HNAction

ACTIONS = [
    ShoutAction,
    SendMailAction,
    HelloAction,
    HNAction
]

ACTION_DICT = { a.name: a for a in ACTIONS }

if __name__ == '__main__':
    for action in ACTIONS:
        print(f"Action '{action.name}'")
        print(action.description)
        print(f"Settings: {action.settings}")
