FROM node:lts-hydrogen

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 8000

ENTRYPOINT ["npm", "run", "start"]