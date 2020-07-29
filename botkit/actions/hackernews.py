import requests


class HNAction:
    name = "Hackernews - Top Story"

    description = """
    Returns the title of the top HN story
    """.strip()

    settings = {}

    def __init__(self, settings=settings):
        pass

    def execute(self, query, intent=None, data_collection={}):
        top_ids_url = 'https://hacker-news.firebaseio.com/v0/topstories.json'
        article_url = 'https://hacker-news.firebaseio.com/v0/item/{}.json'

        top_ids = requests.get(top_ids_url)
        top_article = requests.get(article_url.format(top_ids.json()[0]))
        top_title = top_article.json()['title']

        return f"Top article on HN is '{top_title}'"


if __name__ == '__main__':
    action = HNAction()
    print(action.execute(''))
