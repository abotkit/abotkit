import os
import signal
import sys
import subprocess
import multiprocessing
import requests
import time

os.setpgrp()

root = os.path.dirname(os.path.abspath(__file__))

def spawn(task):
  process = subprocess.Popen(task)
  process.communicate()

try:
  core = [sys.executable, os.path.join(root, 'botkit', 'app.py')]
  ui = ['npm', 'start', '--prefix', os.path.join(root, 'ui')]
  server = ['npm', 'start', '--prefix', os.path.join(root, 'server')]
  
  core = multiprocessing.Process(target=spawn, args=[core])
  core.start()

  core_server_unavailable = True
  print('Waiting for core bot ...')
  while core_server_unavailable:
    try:
      response = requests.get('http://127.0.0.1:5000')
      core_server_unavailable = False
    except requests.exceptions.ConnectionError as e:
      time.sleep(1)
  print('Core bot server started successfully')

  ui = multiprocessing.Process(target=spawn, args=[ui])
  ui.start()

  server = multiprocessing.Process(target=spawn, args=[server])
  server.start()

  core.join()
  ui.join()
  server.join()
except Exception as exception:
  print(exception)
finally:
  os.killpg(0, signal.SIGKILL)