import re


KEYWORD_FILE = 'file'
KEYWORD_LOCATION = 'path'

class FileDataCollection:
    def extract(self, query):
        match_file = re.search(r'{} (\S+)'.format(KEYWORD_FILE), query)
        match_location = re.search(r'{} (\S+)'.format(KEYWORD_LOCATION), query)

        if match_file and match_location:
            data_collection = {
                'file_name': match_file.group(1),
                'file_location': match_location.group(1)
                }
            return data_collection
        else:
            return {}
        


def main():
    dc = FileDataCollection()
    s = 'Create a file bot_test.txt at path D:/Projekte'
    #s = 'how is the weather in'
    m = dc.extract(s)
    print("MATCH: {}".format(m))


if __name__ == '__main__':
    main()