from server.slack import SlackServer
from server.cli import CliServer

SERVERS = [CliServer, SlackServer]
SERVER_DICT = {s.name: s for s in SERVERS}
