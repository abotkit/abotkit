import os
import signal
import sys
import subprocess
import multiprocessing
import requests
import time
import argparse
import shutil


def spawn(task):
  if os.name != 'nt':
    process = subprocess.Popen(task)
  else:
    process = subprocess.Popen(task, shell=True)
  process.communicate()


def delete_folder_content(folder: str, not_to_delete: list):
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

def is_up(url, server_unavailable):
  try:
    response = requests.get(url)
    server_unavailable = False
  except requests.exceptions.ConnectionError as e:
    time.sleep(1)
  return server_unavailable


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--dev', '-d', action='store_true', help='If provided the abotkit components will start in development mode including hot updates etc.')
  parser.add_argument('--clean', '-c', action='store_true', help='Simulate a brand new environment by removing the database and baked core bot files before start')
  parser.add_argument('--rasa-clean', '-cr', action='store_true', help='Simulate a brand new environment by removing existing rasa files and create brand new rasa project')
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
    core = [sys.executable, os.path.join(root, 'botkit', 'app.py')]
    ui = ['npm', 'start', '--prefix', os.path.join(root, 'ui')]
    
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
        rasa_server_unavailable = is_up('http://127.0.0.1:5005', rasa_server_unavailable)
      print('Rasa server started successfully')

      # default port is 5055
      rasa_actions_server = ['rasa', 'run', 'actions', '--cors', '"*"']
      rasa_actions_server = multiprocessing.Process(target=spawn, args=[rasa_actions_server])
      rasa_actions_server.start()

      rasa_actions_server_unavailable = True
      print('Waiting for rasa actions server ...')
      while rasa_server_unavailable:
        rasa_actions_server_unavailable = is_up('http://127.0.0.1:5055', rasa_actions_server_unavailable)
      print('Rasa actions server started successfully')
      os.chdir(root)


    core = multiprocessing.Process(target=spawn, args=[core])
    core.start()

    core_server_unavailable = True
    print('Waiting for core bot ...')
    while core_server_unavailable:
      core_server_unavailable = is_up('http://127.0.0.1:5000', core_server_unavailable)
    print('Core bot server started successfully')

    #ui = multiprocessing.Process(target=spawn, args=[ui])
    #ui.start()

    #server = multiprocessing.Process(target=spawn, args=[server])
    #server.start()

    rasa_init.join()
    rasa_server.join()
    rasa_actions_server.join()
    core.join()
    #ui.join()
    #server.join()
  except Exception as exception:
    print(exception)
  finally:
    print("Processes might not be terminated when using Windows!")
    if os.name != 'nt':
      os.killpg(0, signal.SIGKILL)
    else:
      pass