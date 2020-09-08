import requests
from actions.Action import Action

# Get your API key from https://openweathermap.org/home/sign_up
FORECAST_URL = 'http://api.openweathermap.org/data/2.5/weather?q={}&APPID={}&units=metric'
NO_CITY = 'I could not find a city'
NO_APPID = 'There is no openweathermap app id that I could use'

class OpenWeatherAction(Action):
    name = "Weather"
    description = """
    OpenWeather action. Forecast for a city
    """.strip()

    def __init__(self, settings={}):
        super().__init__(settings)

    def execute(self, query, intent=None, data_collection={}, language='en'):
        if 'appid' not in self.settings:
            return NO_APPID
        
        if 'cities' not in data_collection:
            return NO_CITY
        elif not data_collection['cities']:
            return NO_CITY

        city = data_collection['cities'][0]

        appid = self.settings['appid']
        response = requests.get(FORECAST_URL.format(city, appid)).json()
        if language == 'de':
            description = f"In {city} ist es zur Zeit {response['main']['temp']}C " \
                + f"mit {response['weather'][0]['description']} " \
                + f"und einer gefühlten Temperatur von {response['main']['feels_like']}C. "
        else:
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
