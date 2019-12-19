from persistence.bot_reader import BotReader
from persistence.server_reader import ServerReader
from argparse import ArgumentParser

parser = ArgumentParser(description='abotkit - deployment')

parser.add_argument(
    'bot_file',
    type=str,
    help='Bot file. Found in bots/*.json',
)

parser.add_argument(
    'server_file',
    type=str,
    help='Server file. Found in servers/*.json',
)


def main():
    args = parser.parse_args()

    print("Loading bot")
    bot = BotReader(args.bot_file).load()

    print("Loading server")
    server = ServerReader(args.server_file).load(bot)

    print("Starting server")
    server.start()


if __name__ == '__main__':
    main()
