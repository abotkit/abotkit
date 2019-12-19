FROM python:3.7

WORKDIR /opt/abotkit

COPY . .

RUN pip install -r requirements.txt

CMD python ./deploy.py ./bots/default.json ./servers/cli.json
