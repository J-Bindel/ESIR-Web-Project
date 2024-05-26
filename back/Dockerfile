FROM node:latest
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

# Copy app source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]