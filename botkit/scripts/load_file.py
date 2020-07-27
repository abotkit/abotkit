# Loads a simple shout bot from storage
import sys
sys.path.append('..')

from persistence.bot_reader import BotReader


def main():
    bot = BotReader('../bots/demo.json').load()
    print(bot.explain('Hi, world!'))


if __name__ == '__main__':
    main()
