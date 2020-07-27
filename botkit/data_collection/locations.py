from geotext import GeoText


class LocationDataCollection:
    def extract(self, query):
        places = GeoText(query)
        return {'cities': places.cities}


if __name__ == '__main__':
    dc = LocationDataCollection()
    print(dc.extract('How is the weather in San Francisco?'))
    print(dc.extract('No city here'))
