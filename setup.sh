#!/bin/bash

cd ui && npm i

cd ../server && npm i

echo "Can you show me the way to your python 3 binary?"
read -p "Press the enter key to use [/usr/bin/python] or specify another path: " PYTHON
PYTHON=${PYTHON:-/usr/bin/python}
echo "{\"python\": \"$PYTHON\"}" > ./server/config.json

read -p "Should I also install the python dependencies? [y/N]" INSTALL_REQUIREMENTS
if [[ $prompt =~ [yY](es)* ]]
then
  cd ../botkit && $PYTHON -m pip install -r requirements.txt
else
  echo "Please issue `pip install -r requirements.txt` in the botkit folder by your own"
fi

echo "You are now ready to use abotkit! Happy chatting 💪"