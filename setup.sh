#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/ui && npm i
cd $DIR/server && npm i

echo "Can you show me the way to your python 3 binary?"
DEFAULT_PATH=$(which python)
read -p "Press the enter key to use [$DEFAULT_PATH] or specify another path: " PYTHON
PYTHON=${PYTHON:-$DEFAULT_PATH}
echo "PYTHON_3=$PYTHON" > $DIR/abotkit.conf

read -p "Should I also install the python dependencies? [y/N]" INSTALL_REQUIREMENTS
if [[ $INSTALL_REQUIREMENTS =~ [yY](es)* ]]
then
  cd $DIR/botkit && $PYTHON -m pip install -r requirements.txt --user
else
  echo "Please issue \"pip install -r requirements.txt --user\" in the botkit folder by your own"
fi

echo "You are now ready to use abotkit! Happy chatting 💪"