FROM python:3.8-slim
RUN apt-get update -y

COPY . /opt/abotkit
WORKDIR /opt/abotkit

EXPOSE 3000

ENTRYPOINT ["python", "start.py", "-quiet", "--no-ui"]