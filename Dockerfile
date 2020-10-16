FROM python:3.8-slim
RUN apt-get update -y
RUN apt-get install -y nodejs npm

RUN pip install requests

COPY . /opt/abotkit
WORKDIR /opt/abotkit

EXPOSE 3000

ENTRYPOINT ["python", "start.py", "--quiet", "--no-ui"]