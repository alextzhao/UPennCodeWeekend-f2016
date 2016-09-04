'use strict';
var socket = io('http://localhost:3000');

socket.emit('PING');

// ---------------------
//    SOCKET HANDLERS
// ---------------------
socket.on('PONG', function (data) {
  console.log('Got PONG!');
});
