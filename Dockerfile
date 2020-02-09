FROM node:13.7.0

RUN npm install -g coffeescript && \
    useradd hubot -m

WORKDIR /home/hubot

ADD ./hubot/ /home/hubot/
COPY ./scripts/ /home/hubot/scripts/

RUN npm install
RUN chown -R hubot:hubot /home/hubot
RUN chown hubot:hubot -R /home/hubot/node_modules/hubot-rocketchat

USER hubot
ENV ROCKETCHAT_USESSL=true

CMD bin/hubot -n $BOT_NAME -a rocketchat
