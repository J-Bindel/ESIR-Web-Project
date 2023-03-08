# start from base image
FROM node:18

# Define working directory
WORKDIR /usr/src/app

# Install Angular CLI
RUN npm install -g @angular/cli

# Copy web project in working directory
COPY . .

# Install dependencies
RUN npm install --loglevel verbose

# expose port
EXPOSE 4200

# start app
CMD [ "ng", "serve", "--disable-host-check", "--host", "0.0.0.0", "--open" ]