#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

trap "exit" INT TERM ERR
trap "kill 0" EXIT

source $DIR/abotkit.conf

npm start --prefix $DIR/ui | cat - &
npm start --prefix $DIR/server &
cd $DIR/botkit/ &&  $PYTHON_3 app.py

wait