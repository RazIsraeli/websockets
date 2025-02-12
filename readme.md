# Pre-requisits:
* Node 20+
* Angular 18 +

# Install
* Open command line and run "npm run install-all".

# Build - Development
* Run command "npm run build-server-w".
* On another terminal run command "npm run build-client-w".
* In launch.json file, set ENVIRONMENT = 'development' to enable cors in server (allowed from port 4200, e.g. Angular's client).
* Press F5 (Run and Debug -> Run Server).

### NOTE: Environment Variables in .vscode/launch.json:

OPTION 1:
"env": {
    "ENVIRONMENT": "production" --> allows you to run the server on port 3000 and serve the client from the server (e.g. open browser on localhost:3000).
},

OPTION 2:
"env": {
    "ENVIRONMENT": "development" --> allows you to start the server but serve the client using ng serve (e.g. open browser on localhost:4200).
},

# Start Program - development
* Open browser on http://localhost:4200 (run the server before by running "npm run start, or by using "Run and Debug" with development config).

# Start Program - production
* Open browser on http://localhost:3000 (run the server by running "npm run start", or by using "Run and Debug" with production config).

# Start Kafka locally
* Open cmd/powershell where Kafka is installed (c:kafka), and run:
    .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
* Open another terminal and run:
     .\bin\windows\kafka-server-start.bat .\config\server.properties

** To createa a new topic - open another terminal and run:
     .\bin\windows\kafka-topics.bat --create --topic quickstart-events --bootstrap-server localhost:9092
** To watch existing topics in bootstrapped server, run:
     .\bin\windows\kafka-topics.bat --describe --bootstrap-server localhost:9092
