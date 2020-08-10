#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

trap "exit" INT TERM ERR
trap "kill 0" EXIT

source $DIR/abotkit.conf

cd $DIR/botkit/ &&  $PYTHON_3 app.py &
echo "Waiting for core bot ..."
while ! curl http://127.0.0.1:5000 -m1 -o/dev/null -s ; do
  sleep 1
done
echo "Core bot server started successfully"

npm start --prefix $DIR/ui | cat - &
npm start --prefix $DIR/server &

wait