FROM python:3.6-slim
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

EXPOSE 8080

# install dependencies and setup ports
RUN cd botkit && pip install -r requirements.txt
RUN cd rasa && pip install -r requirements.txt
RUN cd server && npm install
RUN cd ui && npm install

RUN echo "[PORTS]" >> settings.conf
RUN echo "ui = 8080" >> settings.conf
RUN echo "server = 3000" >> settings.conf
RUN echo "botkit = 5000" >> settings.conf

# start abotkit components
ENTRYPOINT ["python", "-u", "start.py", "--quiet"]