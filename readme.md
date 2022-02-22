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
! Warning !, currently not working
``` openssl openssl req -x509 -nodes -days 365 -newkey rsa:2048 -sha256 -keyout ./certificates/key.key -out ./certificates/certificate.crt ```
### Start server
For development
``` npm run dev ```
For regular
``` npm run start ```