import os
import sys
sys.path.append('..')

from flask import Flask, jsonify, request
from flask_cors import CORS

from actions.actions import ACTIONS
from flask_api import status
from persistence.bot_reader import BotReader
from persistence.bot_writer import BotWriter

app = Flask(__name__)
CORS(app)

bot = BotReader('../bots/default.json').load()
core = bot.core


# Error handling
def check_setup():
    "Checks if Bot has at least one action and example"
    if core.intents == {}:
        raise Exception('Add an intent before using your Bot')

    if not bot.actions:
        raise Exception('Add an actions before using your Bot')


@app.route('/')
def index_route():
    return 'I am alive'


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

    result = {'actions_count': len(bot.enabled_actions)}
    return jsonify(result)


def delete_action():
    intent = request.json['intent']
    bot.delete_action(intent)

    result = {'actions_count': len(bot.enabled_actions)}
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
    saved_bots = os.listdir('../bots/')
    saved_bots = [sb for sb in saved_bots if sb.endswith('.json')]
    return jsonify(saved_bots)


def save_bot():
    try:
        file_name = request.json['file_name']
        name = request.json['name']
        bot.name = name
        BotWriter(bot).write(os.path.join('../bots/', file_name))
        return jsonify('Wrote bot')
    except Exception as e:
        return jsonify(e)


# Load and save bots
@app.route('/bot/<file_name>', methods=['GET'])
def load_bot(file_name):
    global bot
    global core

    try:
        path = os.path.join('../bots/', file_name)
        bot = BotReader(path).load()
        core = bot.core
        return jsonify(f"Loaded bot from {file_name}")
    except Exception as e:
        return jsonify(e)


@app.route('/bot/actions', methods=['GET'])
def bot_actions_route():
    return jsonify(bot.actions)


if __name__ == '__main__':
    app.run(debug=True)
