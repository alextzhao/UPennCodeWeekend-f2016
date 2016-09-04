'use strict'; // puts us in strict mode (js in hard mode)

// gets imports
let Moniker = require('moniker');
let _ = require('underscore');

let users = {};

/* This sets up a pure socket-io server.
 * Later in the guide we upgrade to a full
 * express server, to serve files as well
 * as handle websockets */
let Server = require('socket.io');
let io = Server(3000); //construct a server on port 3000
console.log('SocketIO listening on port 3000');


// SOCKET HANDLER FUNCTIONS
io.on('connection', (socket) => {
  // on 'connection' we need to set some stuff up
  console.log('Got a new connection');

  // -----------------
  //  SOCKET HANDLERS
  // -----------------
  /**
   * Handles PING
   * Responds with a PONG
   */
  socket.on('PING', (data) => {
    console.log('Got a PING');

    socket.emit('PONG'); // reply with a PONG
  });
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
  while(!isUniqueName(name)) {
    name = Moniker.choose();
  }

  return name;
}
