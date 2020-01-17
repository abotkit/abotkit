import os
import sys
import gdown
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from flask import Flask, jsonify, request, abort
from flask_cors import CORS

from actions.actions import ACTIONS
from data_crawler.data_crawler import CRAWLERS
from classifier.classifier import CLASSIFIERS

app = Flask(__name__)
CORS(app)

emotion_classifier = None

@app.route('/data-crawler', methods=['GET'])
def list_crawlers():
    return jsonify([{'name': crawler.name, 'description': crawler.description} for crawler in CRAWLERS.values()])

@app.route('/crawl', methods=['POST'])
def crawl():
    data = request.json
    url = data['url']
    crawler = data['crawler']
    data_crawler = CRAWLERS[crawler]()
    data_crawler.fetch(url)
    return jsonify(data_crawler.list())

@app.route('/actions', methods=['GET'])
def list_actions():
    return jsonify([{'name': action.name, 'description': action.description} for action in ACTIONS])

@app.route('/classifier', methods=['GET'])
def list_classifiers():
    return jsonify([{'name': classifier.name, 'description': classifier.description} for classifier in CLASSIFIERS.values()])

@app.route('/classify', methods=['POST'])
def classify():
    data = request.json
    text = data['text']
    classifier = data['classifier']

    if isinstance(text, str):
        if classifier == 'emotion':
            return jsonify({'is_positve': emotion_classifier.predict(text)})
        else:
            abort(404, 'This isn\'t the classifier you\'re looking for')
    elif isinstance(text, list):
        result = []
        for part in text:
            if classifier == 'emotion':
                result.append(emotion_classifier.predict(part))
            else:
                abort(404, 'This isn\'t the classifier you\'re looking for')
        return jsonify({'is_positve': result})

@app.route('/', methods=['GET'])
def index_route():
    return jsonify({
        '[GET] /data-crawler': 'lists all data crawler',
        '[GET] /actions': 'returns a list of all actions',
        '[GET] /classifier': 'lists all classifiers with a brief description'
    })

if __name__ == '__main__':
    if not emotion_classifier:
        print('Initialize classifiers ... Please wait \U0001F64F')
        download_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'classifier', 'emotion_classifier.pt')
        if not os.path.isfile(download_path):
            url = 'https://drive.google.com/uc?id=1-wUMI9xNsODvSetQpJqZnH9oMMhno91G'
            gdown.download(url, download_path)
            
        emotion_classifier = CLASSIFIERS['emotion'](restore_from_path=download_path)
        print('Done. \U0001F680')
    app.run(debug=True)
