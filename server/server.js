'use strict'; // puts us in strict mode (js in hard mode)

/****************************************
    Setting up the express app
 *****************************************/
let path = require('path');
let express = require('express');
let app = express();
app.use(express.static(path.join(__dirname, '../client')));

// start the server.
let server = app.listen(3000, () => {
    console.log('Express server listening on port 3000');
})
let io = require('socket.io')(server); //construct a server on port 3000










// gets imports
let Moniker = require('moniker');
let _ = require('underscore');
let User = require('./user');


//users array
let users = {};



// SOCKET HANDLER FUNCTIONS
io.on('connection', (socket) => {
    // on 'connection' we need to set some stuff up
    console.log('Got a new connection');

	/** TOY EXAMPLE:
     * Handles PING
     * Responds with a PONG
     */
    socket.on('PING', (data) => {
        console.log('Got a PING');

        socket.emit('PONG'); // reply with a PONG
    });

	// Gets random name using helper function
	// creates new user using random name
	// Adds user to users array, mapping to id of the socket.
    let name = getUniqueName();
    let user = User(socket, name);
    users[socket.id] = user;
    console.log(': CONNECTION - ${USER.TOSTRING()})');

	// emit current state of server to user. Allows user
	// to update their own user list.
	socket.emit('STATE', {
		users: _.mapObject(users, (user) => user.toObj()),
		user: user.getId()
	});

	// emit the new JOIN for all the other users using broadcast function
	// so everyone on the server knows a new user has joined.
	socket.broadcast.emit('JOINED', {user: users[socket.id].toObj()});


	// handles MESG
	socket.on('MESG', (data) => {
		let user = users[socket.id];
		console.log(':MESG - $<user.getName()}> ${data.message}');
		let message = {
			from: user.getName(),
			message: data.message
		};
		io.emit('MESG', message);
	})

	// handles a disconnet
	socket.on('disconnet', () => {
		let user = users[socket.id];
		console.log(':LEFT- ${user.toString()})');
		//alternatively can use io.emit. Broadcasts LEFT event to everyone
		//so everyone can update their own user lists.
		socket.broadcast.emit('LEFT', {user: user.toObj()});
		delete users[socket.id];
	})
});


// HELPER FUNCTIONS
/**
 * Sees if a name is unique
 * @param name The name to check
 * @return boolean true if the name is unique
 */
function isUniqueName(name) {
    let names = _.mapObject(users, (user) => user.getName().toLowerCase());
    return !_.contains(names, name.toLowerCase());
}

/**
 * Gets a unique name using Moniker (showcases basic npm modules)
 * @return String a unique name
 */
function getUniqueName() {
    let name = Moniker.choose();
    while (!isUniqueName(name)) {
        name = Moniker.choose();
    }

    return name;
}
