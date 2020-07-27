from data_collection.locations import LocationDataCollection
from data_collection.files import FileDataCollection

COLLECTORS = [
    LocationDataCollection(),
    FileDataCollection(),
]
