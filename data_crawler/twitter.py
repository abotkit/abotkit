from lxml import html, etree
import requests
import argparse

class TwitterCrawler():
    def __init__(self):
        self.content = []

    def fetch(self, url):
        page = requests.get(url)
        tree = html.fromstring(page.content)
        replies = tree.cssselect('.tweet-text')

        for reply in replies:
            self.content.append(reply.text_content())

    def list(self):
        return self.content


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', '-u', help='the tweet url used for crawling')
    args = parser.parse_args()

    twitterCrawler = TwitterCrawler()
    if args.url:
        url = args.url
    else:
        print('Please use an url argument for crawling')
        print('Usage: twitter.py --url <the tweet url used for crawling>')
        print('https://twitter.com/tagesschau/status/1215011211710025733 will be used as an example ...\n')
        url = 'https://twitter.com/tagesschau/status/1215011211710025733'

    twitterCrawler.fetch(url)
    print(twitterCrawler.list())