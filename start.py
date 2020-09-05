import os
import sys
import subprocess
import configparser
import signal
import multiprocessing
import requests
import time
import argparse
import shutil

config = configparser.ConfigParser()

def askForPort(question, default_port):
  while True:
    try:
        port = input(question + ' [{}]:'.format(default_port)).strip()
        if port == '':
          return default_port
        else:
          port = int(port)
    except ValueError:
        print("Please use a number below 65535 or use a blank input to choose the default port {}".format(default_port))
        continue
      
    if port > 65535:
      print("Please use a number below 65535 or use a blank input to choose the default port {}".format(default_port))
    else:
      return port

if not os.path.isfile('settings.conf'):
  print('Hi, it looks like you are using abotkit for the first time. We need to do a quick dependency installation and setup. This shouldn\'t take long.')
  botkit_port = askForPort('What port can I use to deploy the core bot server?', 5000)
  server_port = askForPort('We need to run an abstraction layer between your ui and your bot framework. Which port can I use?', 3000)
  ui_port = askForPort('Last but not least: The ui is a single page application. What port can I use to run the ui?', 21520)
  
  config['PORTS'] = {
    "ui": ui_port,
    "server": server_port,
    "botkit": botkit_port
  } 

  with open('settings.conf', 'w') as handle:
    config.write(handle)

  if os.name != 'nt':
    shell = False
  else:
    shell = True

  root = os.path.dirname(os.path.abspath(__file__))

  ui = subprocess.Popen(['npm', 'i'], cwd=os.path.join(root, 'ui'), shell=shell)
  ui.communicate()
  ui.wait()

  server = subprocess.Popen(['npm', 'i'], cwd=os.path.join(root, 'server'), shell=shell)
  server.communicate()
  server.wait()

  response = input('Should I also install the python dependencies? [y/N]').strip().lower()
  if response == 'yes' or response == 'y':
    botkit = subprocess.Popen([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt' ,'--user'], cwd=os.path.join(root, 'botkit'), shell=shell)
    botkit.communicate()
    botkit.wait()

    rasa = subprocess.Popen([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt' ,'--user'], cwd=os.path.join(root, 'rasa'), shell=shell)
    rasa.communicate()
    rasa.wait()
  else:
    print("Please issue \"pip install -r requirements.txt --user\" in the botkit folder by your own and restart this script again.")
    sys.exit()

  print("You are now ready to use abotkit! I will now start all abotkit components. Happy chatting 💪")

def spawn(task):
  if os.name != 'nt':
    process = subprocess.Popen(task)
  else:
    process = subprocess.Popen(task, shell=True)
  process.communicate()


def delete_folder_content(folder, not_to_delete):
  for filename in os.listdir(folder):
    if filename not in not_to_delete:
      file_path = os.path.join(folder, filename)
      try:
          if os.path.isfile(file_path) or os.path.islink(file_path):
              os.unlink(file_path)
          elif os.path.isdir(file_path):
              shutil.rmtree(file_path)
      except Exception as e:
          print('Failed to delete %s. Reason: %s' % (file_path, e))

def check_server(url, server_unavailable):
  try:
    response = requests.get(url)
    server_unavailable = False
  except requests.exceptions.ConnectionError as e:
    time.sleep(1)
  return server_unavailable

config.read('settings.conf')
ui_port = config['PORTS']['ui']
server_port = config['PORTS']['server']
botkit_port = config['PORTS']['botkit']

parser = argparse.ArgumentParser()
parser.add_argument('--dev', '-d', action='store_true', help='If provided the abotkit components will start in development mode including hot updates etc.')
parser.add_argument('--clean', '-c', action='store_true', help='Simulate a brand new environment by removing the database and baked core bot files before start')
parser.add_argument('--rasa-clean', '-rc', action='store_true', help='Simulate a brand new environment by removing existing rasa files and create brand new rasa project')
parser.add_argument('--no-ui', '-nu', action='store_true', help='Starts the botkit core server and abstraction layer but without the single page application ui')
parser.add_argument('--language', '-l', default="english", help="This argument can be used to specifiy the bot language (english, german). This only works within a brand new environment (On the first usage or using --clean).")
args = parser.parse_args()

root = os.path.dirname(os.path.abspath(__file__))

if os.name != 'nt':
  os.setpgrp()

if args.clean:
  database = os.path.join(root, 'server', 'db.sqlite3')
  core_bot_dir = os.path.join(root, 'botkit', 'bots')
  core_bot_phrases = os.path.join(root, 'botkit', 'actions', 'phrases.json')

  if os.path.exists(database):
    os.remove(database)
  
  for filename in os.listdir(core_bot_dir):
    if filename.endswith('.json'):
      os.remove(os.path.join(core_bot_dir, filename))
  
  if os.path.exists(core_bot_phrases):
    os.remove(core_bot_phrases)
try:
  os.environ["ABOTKIT_CORE_SERVER_PORT"] = botkit_port
  core = [sys.executable, os.path.join(root, 'botkit', 'app.py')]
  
  os.environ["PORT"] = ui_port
  os.environ["REACT_APP_ABOTKIT_SERVER_PORT"] = server_port
  ui = ['npm', 'start', '--prefix', os.path.join(root, 'ui')]
  

  os.environ["ABOTKIT_SERVER_PORT"] = server_port
  if args.dev:
    server = ['npm', 'run', 'dev', '--prefix', os.path.join(root, 'server')]
  else:
    server = ['npm', 'start', '--prefix', os.path.join(root, 'server')]

  if args.rasa_clean:
    delete_folder_content(os.path.join(root, 'rasa'), ['requirements.txt'])
    rasa_init = ['rasa', 'init', '--no-prompt']
    os.chdir(os.path.join(root, 'rasa'))
    rasa_init = multiprocessing.Process(target=spawn, args=[rasa_init])
    rasa_init.start()

    rasa_setup_running = True
    print('Waiting for rasa setup to finish ...')
    while rasa_setup_running:
      try:
        if os.listdir(os.path.join(root, 'rasa', 'models')):
          rasa_setup_running = False
      except FileNotFoundError as e:
        pass
    print('Rasa setup finished ...')
    time.sleep(2)
    print('Start rasa sever and rasa actions server ...')
    # default port is 5005
    rasa_server = ['rasa', 'run', '--enable-api', '--cors', '"*"']
    rasa_server = multiprocessing.Process(target=spawn, args=[rasa_server])
    rasa_server.start()

    rasa_server_unavailable = True
    print('Waiting for rasa server ...')
    while rasa_server_unavailable:
      rasa_server_unavailable = check_server('http://127.0.0.1:5005', rasa_server_unavailable)
    print('Rasa server started successfully')

    # default port is 5055
    rasa_actions_server = ['rasa', 'run', 'actions', '--cors', '"*"']
    rasa_actions_server = multiprocessing.Process(target=spawn, args=[rasa_actions_server])
    rasa_actions_server.start()

    rasa_actions_server_unavailable = True
    print('Waiting for rasa actions server ...')
    while rasa_server_unavailable:
      rasa_actions_server_unavailable = check_server('http://127.0.0.1:5055', rasa_actions_server_unavailable)
    print('Rasa actions server started successfully')
    os.chdir(root)

  core = multiprocessing.Process(target=spawn, args=[core])
  core.start()

  core_server_unavailable = True
  print('Waiting for core bot ...')
  while core_server_unavailable:
    core_server_unavailable = check_server('http://127.0.0.1:{}'.format(botkit_port), core_server_unavailable)
  print('Core bot server started successfully')

  if not args.no_ui:
    ui = multiprocessing.Process(target=spawn, args=[ui])
    ui.start()

  server = multiprocessing.Process(target=spawn, args=[server])
  server.start()

  abotkit_server_unavailable = True
  print('Waiting for abotkit server ...')
  while abotkit_server_unavailable:
    abotkit_server_unavailable = check_server('http://127.0.0.1:{}/healthy'.format(server_port), abotkit_server_unavailable)
  print('Abotkit server started successfully. Start baking our "Default Bot"')

  try:
    response = requests.post('http://127.0.0.1:{}/bot/bake'.format(server_port), json={ "bot_name": "Default Bot", "bot_type": "abotkit-core" })
  except Exception as error:
    print('Failed to bake the "Default Bot"')
    print(error)
  
  if response.status_code == 200:
    print('Deploy the default bot')
    try:
      requests.get('http://127.0.0.1:{}/core/enable/Default%20Bot'.format(server_port))
      print('The default bot was deployed successfully 🦾')
    except Exception as error:
      print('Failed to deploy the "Default Bot"')
      print(error)

  if args.rasa_clean:
    rasa_init.join()
    rasa_server.join()
    rasa_actions_server.join()
  core.join()
  ui.join()
  server.join()
except Exception as exception:
  print(exception)
finally:
  if os.name != 'nt':
    os.killpg(0, signal.SIGKILL)
  else:
    print("Processes might not be terminated when using Windows!")

