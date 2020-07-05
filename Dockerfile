FROM node:10.15.0-alpine

USER root

ENV HOME=/home/node/app

ENV NODE_CONFIG_DIR=$HOME/src/config

WORKDIR $HOME

RUN mkdir node_modules

RUN chown -R node:node $HOME

COPY package.json .

COPY yarn.lock .

RUN yarn

COPY . .

CMD yarn start
