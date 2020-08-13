import os
import sys
import subprocess

root = os.path.dirname(os.path.abspath(__file__))

ui = subprocess.Popen(['npm', 'i'], cwd=os.path.join(root, 'ui'))
ui.communicate()
ui.wait()

server = subprocess.Popen(['npm', 'i'], cwd=os.path.join(root, 'server'))
server.communicate()
server.wait()

response = input('Should I also install the python dependencies? [y/N]').strip().lower()
if response == 'yes' or response == 'y':
  botkit = subprocess.Popen([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt' ,'--user'], cwd=os.path.join(root, 'botkit'))
  botkit.communicate()
  botkit.wait()
else:
  print("Please issue \"pip install -r requirements.txt --user\" in the botkit folder by your own")

print("You are now ready to use abotkit! Happy chatting 💪")
