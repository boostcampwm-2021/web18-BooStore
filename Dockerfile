FROM node:14

WORKDIR /usr/src/app

COPY backend/package*.json ./

RUN npm install -g typescript nodemon prettier eslint

WORKDIR /usr/src/app/backend

RUN npm install

COPY . /usr/src/app

EXPOSE 3000

CMD ["npm","run", "start"]