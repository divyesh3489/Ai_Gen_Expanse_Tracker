FROM python:3.10-slim
LABEL maintainer="Divyesh Gurjar"

ENV PYTHONUNBUFFERED 1 

COPY requirements.txt /temp/requirements.txt
COPY ./ExpanseTraker /app
WORKDIR /app

EXPOSE 8000

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /temp/requirements.txt && \
    rm -rf /temp/requirements.txt



