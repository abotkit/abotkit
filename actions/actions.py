"""
This namespace has the reference to all available actions
"""
from shout import ShoutAction

ACTIONS = [ShoutAction]

if __name__ == '__main__':
    for action in ACTIONS:
        print(f"Action '{action.name}'")
        print(action.description)
        print(f"Settings: {action.settings}")
