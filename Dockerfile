FROM python:3.7

WORKDIR /opt/abotkit

COPY . .

RUN pip install -r requirements.txt