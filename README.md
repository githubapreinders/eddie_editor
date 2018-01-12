# EDDIE EDITOR

This app acts as an interface between developers and the Ibis Adapter Framework. It's base purposes are :
	* Creating an environment in which starting IAF developers can learn the framework.
	* Getting the IAF java docs closer into the development environment
	* Easy creation of Ibis configuration files.
	* Instant code execution over http.

## Viewing on localhost

	* from the root directory run: npm install  
	* from the app directory run: bower install
	* from the server directory run: server.js
	* from the app directory run: index.html

## Developing on localhost

	* from the root directory run: npm install ;  
	* from the app directory run: bower install
	* from the server directory run: nodemon server.js
	* from the root directory run: gulp watch

## Further details
	
	* For actual code execution you will need a running instance of the [Ibis Adapter Framework](https://github.com/ibissource/iaf).You will find instructions on that there.
	* Eddie's main page is for editing by developers and students. Via the wrench icon admins can modify descriptions for classes and properties, add new entities, and add urls to watch tutorials. This page will of course only be available through authentication, not implemented yet.
	* Eddie has 6 caching slots that can be renamed and locked, accessible via the config.
	* On the backend there is a sandbox Mongo Database which reflects in its documents the exact datamodel that Eddie uses.

## TODO's  
	
	* The Node backend should be replaced by Ibis api listeners.
	* Eddie should be able to inspect current Ibis configurations.
	* An authentication model should be implemented, dependent on how people are going to work with Eddie. With publicly running IAF-instances there should come user registration, with private instances authentication would be only for administrators.
	* An assessment of usability should be made, for instance how experience coders would expect code-completion or formatting to behave. 





