
Boilerplate from spa-express-backbone
connect-flash is needed for Passport LocalStrategy;

#README

##Server installation


  npm install

Generate a configuration file and set the relevant properties:

  node ./source/config.js -s > config.yaml

Add the umx-api module to the node\_modules folder.

Launch the server:

  node ./app.js -c config.yaml

  or a shortcut:

  npm start

##Client installation

  bower install

Open a browser at the URL specified in the server configuration file.




