FROM python:3.8-slim-buster as BASE

RUN mkdir /app 

COPY bot/. /app
COPY pyproject.toml /app 

WORKDIR /app
ENV PYTHONPATH=${PYTHONPATH}:${PWD} 

RUN pip3 install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev


CMD ["python", "./main.py" ]