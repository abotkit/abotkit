import requests

# Get your API key from https://openweathermap.org/home/sign_up
FORECAST_URL = 'http://api.openweathermap.org/data/2.5/weather?q={}&APPID={}'
NO_CITY = 'I could not find a city'
SETTINGS = {'appid': 'STRING'}


class OpenWeatherAction:
    name = "Weather"

    description = """
    OpenWeather action. Forecast for a city
    """.strip()

    def __init__(self, settings=SETTINGS):
        self.settings = settings

    def execute(self, query, data_collection={}):
        if 'cities' not in data_collection:
            return NO_CITY
        elif not data_collection['cities']:
            return NO_CITY

        city = data_collection['cities'][0]

        if 'appid' not in self.settings:
            return 'I need an API key'

        appid = self.settings['appid']
        print(FORECAST_URL.format(city, appid))
        response = requests.get(FORECAST_URL.format(city, appid))
        print(response.json())
        return 'hello'


def main():
    action = OpenWeatherAction(
        settings={'appid': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'})
    print(action.execute('hello', data_collection={}))
    print(action.execute('hello', data_collection={'cities': []}))
    print(action.execute('hello', data_collection={'cities': ['London']}))


if __name__ == '__main__':
    main()
