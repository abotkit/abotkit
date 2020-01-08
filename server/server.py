import os
import sys
sys.path.append('..')

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/')
def index_route():
    return 'I am alive'


if __name__ == '__main__':
    app.run(debug=True)
