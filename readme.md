# Pre-requisits:
* Node 20+
* Angular 18 +

# Install
* Open command line and run "npm run install-all".

# Build - Development
* Run command "npm run build-server-w".
* On another terminal run command "npm run build-client-w".
* Press F5 (Run and Debug -> Run Server).

### NOTE: Environment Variables in .vscode/launch.json:

OPTION 1:
"env": {
    "ENVIRONMENT": "production" --> allows you to run the server on port 3000 and serve the client from the server.
},

OPTION 2:
"env": {
    "ENVIRONMENT": "development" --> allows you to start the server but serve the client using ng server on port 4200 (Angular's default).
},

# Start Program - development
* Open browser on http://localhost:4200 (run the server before by running "npm run start").

# Start Program - production
* Open browser on http://localhost:3000
