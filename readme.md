# usermanagement

this is my boilerplate when it comes to a new web app using vanilla js

# Specifications
 - node for the base
 - express for request management
 - ejs for html templating
 - mongoose (mongodb) for long term user storage


# Setup
### Clone repository
``` git clone https://github.com/Chicken112/usermanagement.git ```
### Set up node and install packages
``` npm i ```
### Set up certificates (only for https)
``` openssl req -nodes -new -x509 -keyout ./certificates/server.key -out ./certificates/server.cert ```
### Start server
For development
``` npm run dev ```
For regular
``` npm run start ```