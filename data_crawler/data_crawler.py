"""
This namespace has the reference to all available crawlers
"""
from data_crawler.twitter import TwitterCrawler

CRAWLERS = {
    'twitter': TwitterCrawler
}

if __name__ == '__main__':
    for crawler in CRAWLERS.values():
        print(f"Data crawler '{crawler.name}'")
        print(crawler.description)
