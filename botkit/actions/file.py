import os
import requests

NO_FILE = "I could not add the file"

class FileAction:
    name = "Add a file"

    description = """
    Adds a file with a given name to a given localtion
    """.strip()

    settings = {}

    def __init__(self, settings=settings):
        pass

    def execute(self, query, data_collection={}):
        if 'file_location' not in data_collection \
            or 'file_name' not in data_collection:
            return NO_FILE
        elif not data_collection['file_location'] \
            or not data_collection['file_name']:
            return NO_FILE

        file_location = data_collection['file_location']
        file_name = data_collection['file_name']

        if not os.path.exists(file_location):
            os.makedirs(file_location)

        with open(os.path.join(file_location, file_name), 'w') as temp_file:
            temp_file.write('# File created by a bot')

        return f"File with name '{file_name}' was created at '{file_location}"

def main():
    action = FileAction()
    print(action.execute('file', data_collection={
        'file_location': 'D:/Projekte',
        'file_name': 'bot_test_file.txt'}))


if __name__ == '__main__':
    main()