import requests

# Get your API key from https://openweathermap.org/home/sign_up
FORECAST_URL = 'http://api.openweathermap.org/data/2.5/weather?q={}&APPID={}&units=metric'
NO_CITY = 'I could not find a city'
SETTINGS = {'appid': 'STRING'}


class OpenWeatherAction:
    name = "Weather"

    description = """
    OpenWeather action. Forecast for a city
    """.strip()

    # Has no settings
    settings = {}

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
        response = requests.get(FORECAST_URL.format(city, appid)).json()
        description = f"The weather in {city} is {response['main']['temp']}C " \
            + f"with {response['weather'][0]['description']} " \
            + f"and feels like {response['main']['feels_like']}C. "
        return description


def main():
    action = OpenWeatherAction(
        settings={'appid': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'})
    print(action.execute('hello', data_collection={}))
    print(action.execute('hello', data_collection={'cities': []}))
    print(action.execute('hello', data_collection={'cities': ['London']}))


if __name__ == '__main__':
    main()
