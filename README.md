# My project's README


It is an application skeleton for a typical AngularJS web app with implemented Grunt/Bower environment. You can use it to quickly bootstrap your angular webapp projects. It has all necessary resources/files. As your project will grow you will need to add new resources. Look at the full version to select the elements and resources you want to use.

First run

To run Specta you will need a node instaled in your environment. If you don't have a node.js please go to this site http://nodejs.org and download and install proper version.

Node js  8_x Version should be installed to run the application.

 1. curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
 2. sudo apt install nodejs



Next you will need to install grunt

 
npm install -g grunt-cli
 
Next you will need to install bower

 
npm install -g bower
 
And after that go to Specta and run those commands to get all dependencies:

 
npm install
bower install
 
Grunt file is based on Yeoman angular generator with some changes. There are some main task that you can do:

Grunt lIve commnad to run applicatio locally
 1. grunt live

grunt build command for deploy application on production environment
 1. grunt build

grunt live to launch a browser sync server on your source files
"grunt build" to build an optimized version of your application in /dist
