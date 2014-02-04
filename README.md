#TechOnMap Backoffice

This project contains the backoffice of the [TechOnMap website](http://techonmap.fr). It allows to edit collaboratively geolocalized data and to keep an history of the changes. It is implemented on top of NodeJS.

##Server installation

  npm install

Generate a configuration file and set the relevant properties:

  node ./source/config.js -s > config.yaml

Launch the server:

  node ./app.js -c config.yaml

  or a shortcut:

  npm start


##Client installation

  bower install

Open a browser at the URL specified in the server configuration file.

##License

This project is licensed under the MIT License.

##Authors

* Mikhail Kotelnikov
* Stéphane Laurière



