import smtplib, ssl
from actions.Action import Action

class SendMailAction(Action):
    name = 'Mail'
    description = 'A send mail action'
    
    def __init__(self, settings={}):
        default = {
            'port': 465, # SSL,
            'smtp_server': 'smtp.gmail.com'
        }
        super().__init__(default if not settings else settings)
        
    def chooseSettings(self, settings, setting, title):
        if not settings[setting] is None:
            return settings[setting]
        elif not self.settings[setting] is None:
            return self.settings[setting]
        else:
            return input('Type your {} and press enter: '.format(title))         

    def execute(self, message, intent=None, settings={}):
        if settings.port is None:
            port = self.settings.port
        else:
            port = settings.port

        if settings.smtp_server is None:
            smtp_server = self.settings.smtp_server
        else:
            smtp_server = settings.smtp_server
            
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
