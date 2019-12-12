from flask import Flask, request, jsonify
from core.transformer import TransformerCore
from actions.actions import ACTIONS
from bot import Bot
app = Flask(__name__)

# Load core
core = TransformerCore()
core.add_intent('hi', 'shout')

# Create bot
bot = Bot(core)
bot.add_action('shout', ACTIONS[0]())


@app.route('/')
def index_route():
    return 'I am alive'


@app.route('/intent', methods=['POST'])
def intent_route():
    query = request.json['query']
    result = core.intent_of(query)
    return jsonify(result)


@app.route('/handle', methods=['POST'])
def handle_route():
    query = request.json['query']
    result = bot.handle(query)
    return jsonify(result)


@app.route('/explain', methods=['POST'])
def explain_route():
    query = request.json['query']
    result = bot.explain(query)
    return jsonify(result)


@app.route('/example', methods=['POST'])
def example_route():
    example = request.json['example']
    intent = request.json['intent']
    core.add_intent(example, intent)

    result = {'example_count': len(core.intents)}
    return jsonify(result)


@app.route('/actions', methods=['GET', 'POST'])
def actions_route():
    if request.method == 'GET':
        return list_actions()
    elif request.method == 'POST':
        return add_action()


def list_actions():
    res = [{
        'name': a.name,
        'description': a.description,
        'settings': a.settings
    } for a in ACTIONS]
    return jsonify(res)


def add_action():
    name = request.json['name']
    settings = request.json['settings']
    intent = request.json['intent']

    action = next(a for a in ACTIONS if a.name == name)
    action.settings = settings
    bot.add_action(intent, action())

    result = {'actions_count': len(bot.actions)}
    return jsonify(result)


if __name__ == '__main__':
    app.run()
