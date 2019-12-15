#!/bin/bash

dir="$(dirname "${0}")"

python "${dir}/../../admin/server.py" &
flask_pid=$!

PORT=21520 $dir/../node_modules/.bin/react-scripts start &
react_pid=$!

trap 'printf "\nshutting down abotkit server..."; kill $flask_pid; kill $react_pid; printf "\ndone";' EXIT

wait