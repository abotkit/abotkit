import os
import sys
import subprocess

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
  print("Please issue \"pip install -r requirements.txt --user\" in the botkit folder by your own")

print("You are now ready to use abotkit! Happy chatting 💪")
