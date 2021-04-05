FROM node:15.13.0-alpine3.13

# Install yarn and other dependencies via apk
RUN apk add --update git python3 make g++ && \
  rm -rf /tmp/* /var/cache/apk/*

WORKDIR /usr/app

# Install node dependencies - done in a separate step so Docker can cache it.
COPY package-lock.json .
COPY package.json .

RUN npm install --from-lockfile

COPY . .

RUN npm run compile
RUN npm run typegen
