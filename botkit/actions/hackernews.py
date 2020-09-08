import requests
from actions.Action import Action

class HNAction(Action):
    name = "Hackernews - Top Story"
    description = """
    Returns the title of the top HN story
    """.strip()

    def __init__(self, settings={}):
        super().__init__(settings) 

    def execute(self, query, intent=None, data_collection={}, language='en'):
        top_ids_url = 'https://hacker-news.firebaseio.com/v0/topstories.json'
        article_url = 'https://hacker-news.firebaseio.com/v0/item/{}.json'

        top_ids = requests.get(top_ids_url)
        top_article = requests.get(article_url.format(top_ids.json()[0]))
        top_title = top_article.json()['title']

        if language == 'de':
            return f"Der Top Artikel auf Hacker News ist zur Zeit '{top_title}'"
        else:
            return f"Top article on HN is '{top_title}'"


if __name__ == '__main__':
    action = HNAction()
    print(action.execute(''))
