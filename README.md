
Boilerplate from spa-express-backbone
connect-flash is needed for Passport LocalStrategy;

#README

##Server installation


  npm install

Generate a configuration file and set the relevant properties:

  node ./source/config.js -s > config.yaml

Launch the server:

  node ./app.js -c config.yaml

##Client installation

  bower install

Open a browser at the URL specified in the server configuration file.




