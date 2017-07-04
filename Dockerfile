# Set the base image to nginx
FROM node:8.1.2-alpine

# File Author / Maintainer
MAINTAINER Liudonghua <liudonghua123@gmail.com>

# http://www.clock.co.uk/blog/a-guide-on-how-to-cache-npm-install-with-docker
ADD package.json /app/package.json

WORKDIR /app

RUN npm install

RUN npm run build

# copy static resources to the specified location
COPY . /app

# main application command
CMD node dist/
