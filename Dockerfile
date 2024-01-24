FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

run npm install

COPY . .

ARG CLIENT_PORT

EXPOSE ${CLIENT_PORT}

CMD ['npm', 'dev']
