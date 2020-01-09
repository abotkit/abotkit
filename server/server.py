import os
import sys
sys.path.append('..')

from flask import Flask, jsonify
from flask_cors import CORS

from actions.actions import ACTIONS
from data_crawler.data_crawler import CRAWLERS
from classifier.classifier import CLASSIFIERS

app = Flask(__name__)
CORS(app)

@app.route('/data-crawler', methods=['GET'])
def list_crawlers():
    return jsonify([{'name': crawler.name, 'description': crawler.description} for crawler in CRAWLERS])

@app.route('/actions', methods=['GET'])
def list_actions():
    return jsonify([{'name': action.name, 'description': action.description} for action in ACTIONS])

@app.route('/classifier', methods=['GET'])
def list_classifiers():
    return jsonify([{'name': classifier.name, 'description': classifier.description} for classifier in CLASSIFIERS])

@app.route('/', methods=['GET'])
def index_route():
    return jsonify({
        '[GET] /data-crawler': 'lists all data crawler',
        '[GET] /actions': 'returns a list of all actions',
        '[GET] /classifier': 'lists all classifiers with a brief description'
    })

if __name__ == '__main__':
    app.run(debug=True)
