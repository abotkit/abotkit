from flask import Flask, request, jsonify
from core.transformer import TransformerCore
app = Flask(__name__)

core = TransformerCore()
core.add_intent('hi', 'greeting')


@app.route('/')
def index_route():
    return 'I am alive'


@app.route('/intent', methods=['POST'])
def intent_route():
    query = request.json['query']
    result = core.intent_of(query)
    return jsonify(result)


@app.route('/example', methods=['POST'])
def example_route():
    example = request.json['example']
    intent = request.json['intent']
    core.add_intent(example, intent)

    result = {'example_count': len(core.intents)}
    return jsonify(result)


if __name__ == '__main__':
    app.run()
