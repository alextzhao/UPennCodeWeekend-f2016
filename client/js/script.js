'use strict';

let Server = require('socket.io');
let io = Server(3000);
console.log("SocketIO listening on 3000");

//Socket Handler Functions
io.on('connection', (socket) => {
	console.log("GOt a new Connection");

	//Socket Handers
	/*
		Handles PING
		Responds with PONG
	 */

	socket.on('PING', (data) => {
		console.log("Got a PING");

		socket.emit('PONG'); // reply with PONG
	})
})
