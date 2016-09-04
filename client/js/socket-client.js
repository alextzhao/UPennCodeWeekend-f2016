'use strict';
var socket = io('http://localhost:3000');

// stores user in channel. It's a dictionary with id as key
// User objects have these fields
//   - id     (user id)
//   - name   (user name)
//   - string (string representation)
var users = {};

// stores the client user id
// hence users[me] or users.me gives the client user
var me = socket.id;

socket.emit('PING');

// ---------------------
//    SOCKET HANDLERS
// ---------------------
socket.on('PONG', function (data) {
  console.log('Got PONG!');
});

// ---------------
//     HELPERS
// ---------------

/**
 * Showcases functional Javascript (_.fold) and ternary operators
 * to get a list of the users currently chatting
 */
function getUserList() {
  return _.reduce(users,
                  function (rest, user) {
                    return (rest ? rest + ', ' : '') + user.name;
                  },
                  ''
                 );
}

/**
 * Sends a MESG to the server
 */
function sendMessage(message) {
  socket.emit('MESG', {message: message});
}
