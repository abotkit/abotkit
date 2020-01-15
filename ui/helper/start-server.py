import subprocess
import os
import sys

def main():
    path = os.path.dirname(os.path.realpath(__file__))

    print('Start abotkit server \U0001F916')
    server = subprocess.Popen(['python', os.path.join(path, '..', '..', 'server', 'server.py')])

    print('Start abotkit ui \U0001F4AC')
    environment = {**os.environ, 'PORT': '21520'}
    ui = subprocess.Popen(['npm', 'run', 'start-frontend-only', '--prefix', os.path.join(path, '..')], env=environment, shell=sys.platform.startswith('win'))

    print('Use CTRL + C for shutdown server and ui')
    try:
        [process.wait() for process in [server, ui]]
    except (KeyboardInterrupt, SystemExit):
        print('\nShutting down abotkit server and ui...')
        ui.terminate()
        server.terminate()
        print('Done. Bye \U0001F60A')
        return

if __name__ == '__main__': 
    main()
