FROM node:13.7.0

RUN npm install -g coffee-script yo generator-hubot  &&  \
    useradd hubot -m

USER hubot

WORKDIR /home/hubot

ENV BOT_NAME "spht"
ENV BOT_OWNER "Marathon"
ENV BOT_DESC "Hubot with rocketbot adapter"
ENV ROCKETCHAT_USESSL=true

ENV EXTERNAL_SCRIPTS=hubot-rocketchat,hubot-diagnostics,hubot-help,hubot-giphy-gifme,hubot-humanity,hubot-azure-brain

RUN yo hubot --owner="$BOT_OWNER" --name="$BOT_NAME" --description="$BOT_DESC" --defaults && \
    node -e "console.log(JSON.stringify('$EXTERNAL_SCRIPTS'.split(',')))" > external-scripts.json && \
    npm install $(node -e "console.log('$EXTERNAL_SCRIPTS'.split(',').join(' '))")

RUN rm /home/hubot/scripts/example.coffee

COPY ./scripts/ /home/hubot/scripts/

# hack added to get around owner issue: https://github.com/docker/docker/issues/6119
USER root
RUN chown hubot:hubot -R /home/hubot/node_modules/hubot-rocketchat
RUN chown hubot:hubot -R /home/hubot/scripts
USER hubot


CMD bin/hubot -n $BOT_NAME -a rocketchat
