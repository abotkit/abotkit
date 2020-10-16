FROM python:3.8-slim
RUN apt-get update -y

# install npm
RUN apt-get install -y nodejs npm curl
RUN npm i npm@latest -g
RUN npm cache clean -f
RUN npm install -g n
RUN n stable

# install requests module
RUN pip install requests

# copy code
COPY . /opt/abotkit
WORKDIR /opt/abotkit

EXPOSE 3000

# install dependencies and setup ports
RUN python start.py --setup-only --quiet

# start abotkit components
ENTRYPOINT ["python", "-u", "start.py", "--quiet", "--no-ui"]