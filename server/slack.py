from slack.rtm.client import RTMClient

SETTINGS = {'slack_token': 'STRING'}


class SlackServer:
    def __init__(self, bot, settings=SETTINGS):
        self.bot = bot
        self.token = settings['slack_token']

    def bot_response(self, **payload):
        data = payload['data']
        web_client = payload['web_client']
        channel_id = data['channel']

        # Check if bot send the message himself
        if 'user' not in data:
            return

        user = data['user']
        query = data.get('text', [])

        try:
            res = self.bot.handle(query)
        except Exception as e:
            res = f"@{user}: got an error\n{e}"

        web_client.chat_postMessage(channel=channel_id, text=res)

    def start(self):
        RTMClient.on(event='message', callback=self.bot_response)
        rtm_client = RTMClient(token=self.token)
        rtm_client.start()


def main():
    import sys
    sys.path.append('..')

    from bot import Bot
    from core.transformer import TransformerCore

    core = TransformerCore()
    core.add_intent('How is the weather?', 'weather')
    bot = Bot(core)

    token = 'xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

    server = SlackServer(bot, settings={'slack_token': token})
    server.start()


if __name__ == '__main__':
    main()
