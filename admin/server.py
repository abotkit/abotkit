from flask import Flask, request, jsonify
from flask_api import status
import sys
sys.path.append('..')
import os
from core.transformer import TransformerCore
from actions.actions import ACTIONS
from bot import Bot
from flask_cors import CORS
from persistence.bot_writer import BotWriter
from persistence.bot_reader import BotReader

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
    check_setup()
    query = request.json['query']
    result = core.intent_of(query)
    return jsonify(result)


@app.route('/handle', methods=['POST'])
def handle_route():
    check_setup()
    query = request.json['query']
    result = bot.handle(query)
    return jsonify(result)


@app.route('/explain', methods=['POST'])
def explain_route():
    check_setup()
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
    else:
        return HTTP_405_METHOD_NOT_ALLOWED


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

    result = {'actions_count': len(bot.actions)}
    return jsonify(result)


def delete_action():
    intent = request.json['intent']
    bot.delete_action(intent)

    result = {'actions_count': len(bot.actions)}
    return jsonify(result)


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


if __name__ == '__main__':
    app.run()
