import smtplib, ssl

class SendMailAction:
    name = "Shout"

    description = """
    A send mail action.
    """.strip()

    config = {
        port: 465 # SSL,
        smtp_server: 'smtp.gmail.com'
    }

    def __init__(self, settings=config):
        self.settings = settings

    def chooseSettings(self, settings, setting, title):
        if settings[setting] is not None:
            return settings[setting]
        elif self.settings[setting] is not None:
            return self.settings[setting]
        else:
            return input('Type your {} and press enter: '.format(title))         

    def execute(self, message, settings):
        port = self.settings.port if settings.port is None
        smtp_server = self.settings.smtp_server if settings.smtp_server is None
        sender_email = self.chooseSettings(settings, 'sender_email', 'sender email')
        receiver_email = self.chooseSettings(settings, 'receiver_email', 'receiver email')
        
        password = self.chooseSettings(settings, 'password', 'password')

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)


def main():
    action = SendMailAction()
    action.execute('''
        Subject: Testmail 
        This message is just an abotkit test message
    ''')


if __name__ == '__main__':
    main()
