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
    global core
    global bot

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


@app.route('/example', methods=['GET', 'POST', 'DELETE'])
def example_route():
    global core

    if request.method == 'GET':
        return jsonify(core.intents)
    elif request.method == 'POST':
        example = request.json['example']
        intent = request.json['intent']
        core.add_intent(example, intent)

        result = {'example_count': len(core.intents)}
        return jsonify(result)
    elif request.method == 'DELETE':
        example = request.json['example']
        core.remove_intent(example)
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


@app.route('/available/actions', methods=['GET'])
def available_actions():
    res = [{
        'name': action.name,
        'description': action.description
    } for action in ACTIONS]

    return jsonify(res)

def list_actions():
    global bot

    res = [{
        'name': a['action'].name,
        'description': a['action'].description,
        'settings': a['action'].settings,
        'active': a['active'],
    } for a in bot.actions]
    return jsonify(res)


def add_action():
    global bot

    name = request.json['name']
    settings = request.json['settings']
    intent = request.json['intent']

    action = next(a for a in ACTIONS if a.name == name)
    bot.add_action(intent, action(settings=settings))

    result = {'action_added': name}
    return jsonify(result)


def delete_action():
    global bot

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
            if 'phrases' in request.json['configuration']:
                with open(os.path.join(root, 'actions', 'phrases.json'), 'w') as handle:
                    json.dump(request.json['configuration']['phrases'], handle, indent=2, sort_keys=True)
                del request.json['configuration']['phrases']

            with open(os.path.join(root, 'bots', request.json['configuration']['name'] + '.json'), 'w') as handle:
                json.dump(request.json['configuration'], handle, indent=2)
            return jsonify('Successfully wrote configuration of bot {} to file'.format(request.json['configuration']['name']))       
        else:
            bot.name = request.json['bot_name']
            BotWriter(bot).write(os.path.join(root, 'bots', bot.name + '.json'))
            return jsonify('Successfully wrote current bot {} to file'.format(bot.name))
    except Exception as e:
        return jsonify(e)


@app.route('/phrases', methods=['POST'])
def add_phrases():
    global bot

    phrases_file = os.path.join(root, 'actions', 'phrases.json')
    phrases = {}
    if os.path.exists(phrases_file):
        try:
            with open(phrases_file) as handle:
                phrases = json.load(handle)
        except Exception as e:
            return jsonify(e)

    for phrase in request.json['phrases']:
        if phrase['intent'] in phrases:
            phrases[phrase['intent']].append(phrase['text'])
        else:
            phrases[phrase['intent']] = [phrase['text']]
    
    try:
        with open(phrases_file, 'w') as handle:
            json.dump(phrases, handle, indent=2, sort_keys=True)
        
        bot.update_actions()
        return jsonify('Updated phrases successfully')
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
