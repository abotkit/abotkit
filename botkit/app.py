import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_api import status
import json

from actions.actions import ACTIONS
from flask_api import status
from persistence.bot_reader import BotReader
from persistence.bot_writer import BotWriter

app = Flask(__name__)
root = os.path.dirname(os.path.abspath(__file__))
CORS(app)


# Error handling
def check_setup():
    "Checks if Bot has at least one action and example"
    if core.intents == {}:
        raise Exception('Add an intent before using your Bot')

    if not bot.actions:
        raise Exception('Add an actions before using your Bot')


@app.route('/')
def index_route():
    if 'bot' in globals():
        return 'I am alive'
    else:
        return 'You need to load a bot first using the [GET] /bot/:bot_name endpoint', status.HTTP_503_SERVICE_UNAVAILABLE


@app.route('/intent', methods=['POST'])
def intent_route():
    try:
        check_setup()
    except Exception as e:
        return jsonify(e), status.HTTP_412_PRECONDITION_FAILED
    query = request.json['query']
    result = core.intent_of(query)
    return jsonify(result)


@app.route('/handle', methods=['POST'])
def handle_route():
    try:
        check_setup()
    except Exception as e:
        return jsonify(e), status.HTTP_412_PRECONDITION_FAILED
    query = request.json['query']
    result = bot.handle(query)
    return jsonify(result)


@app.route('/explain', methods=['POST'])
def explain_route():
    try:
        check_setup()
    except Exception as e:
        return jsonify(e), status.HTTP_412_PRECONDITION_FAILED
    query = request.json['query']
    result = bot.explain(query)
    return jsonify(result)


@app.route('/example/<string:intent>', methods=['GET'])
def intent_example_route(intent):
    examples = []
    for example in core.intents:
        if intent == core.intents[example]:
            examples.append(example)
    return jsonify(examples)


@app.route('/example', methods=['GET', 'POST'])
def example_route():
    if request.method == 'GET':
        return jsonify(core.intents)
    elif request.method == 'POST':
        example = request.json['example']
        intent = request.json['intent']
        core.add_intent(example, intent)

        result = {'example_count': len(core.intents)}
        return jsonify(result)


@app.route('/actions', methods=['GET', 'POST', 'DELETE'])
def actions_route():
    if request.method == 'GET':
        return list_actions()
    elif request.method == 'POST':
        return add_action()
    elif request.method == 'DELETE':
        return delete_action()


def list_actions():
    res = [{
        'name': a['action'].name,
        'description': a['action'].description,
        'settings': a['action'].settings,
        'active': a['active'],
    } for a in bot.actions]
    return jsonify(res)


def add_action():
    name = request.json['name']
    settings = request.json['settings']
    intent = request.json['intent']

    action = next(a for a in ACTIONS if a.name == name)
    bot.add_action(intent, action(settings=settings))

    result = {'action_added': name}
    return jsonify(result)


def delete_action():
    intent = request.json['intent']
    bot.delete_action(intent)

    result = {'action_deleted': intent}
    return jsonify(result)


@app.route('/bot', methods=['GET'])
def bot_route():
    return jsonify({
        'name': bot.name,
        'actions': bot.actions,
    })


# Load and save bots
@app.route('/bots', methods=['GET', 'POST'])
def bots_route():
    if request.method == 'GET':
        return list_bots()
    elif request.method == 'POST':
        return save_bot()


def list_bots():
    saved_bots = os.listdir(root, 'bots')
    saved_bots = [sb for sb in saved_bots if sb.endswith('.json')]
    return jsonify(saved_bots)


def save_bot():
    try:
        if 'configuration' in request.json:
            with open(os.path.join(root, 'bots', request.json['configuration']['name'] + '.json'), 'w') as handle:
                json.dump(request.json['configuration'], handle)
            return jsonify('Successfully wrote configuration of bot {} to file'.format(request.json['configuration']['name']))       
        else:
            bot.name = request.json['bot_name']
            BotWriter(bot).write(os.path.join(root, 'bots', bot.name + '.json'))
            return jsonify('Successfully wrote current bot {} to file'.format(bot.name))
    except Exception as e:
        return jsonify(e)


@app.route('/bot/<bot_name>', methods=['GET'])
def load_bot(bot_name):
    global bot
    global core

    try:
        path = os.path.join(root, 'bots', bot_name + '.json')
        bot = BotReader(path).load()
        core = bot.core
        return jsonify('Successfully loaded bot from {}.json'.format(bot_name))
    except Exception as e:
        return jsonify(e)


if __name__ == '__main__':
    app.run(debug=True)
