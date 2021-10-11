FROM node:16-alpine

RUN apk update && apk add python3 make g++ bash curl jq automake libtool autoconf

# Copy projects folder into container's app folder
COPY . /app

RUN chown -R node:node /app/

# Change to app directory
WORKDIR /app

# Enable debugging port
EXPOSE 9200
EXPOSE 3000

# Dont run as root
USER node

RUN yarn
RUN yarn run build

CMD [ "yarn", "start:prod" ]
