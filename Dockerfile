FROM node:slim

RUN git clone https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app.git
RUN npm install

CMD ["npm", "run", "dev"]


