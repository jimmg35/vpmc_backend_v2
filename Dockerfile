FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY . .

RUN yarn
RUN npm install typescript -g
RUN tsc

EXPOSE 9085
CMD ["node", "./build/service.js"]