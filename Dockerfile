FROM node:16-alpine

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  cat /run/secrets/SENTRY_AUTH_TOKEN

RUN apk update
RUN apk --no-cache --virtual build-dependencies add \
    python3 \ 
    make \
    g++ 

RUN mkdir -p /app
WORKDIR /app
COPY . /app

# Enable Yarn
RUN corepack enable

RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]