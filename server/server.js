'use strict'; // puts us in strict mode (js in hard mode)

/****************************************
    Setting up the express app
 *****************************************/
let path = require('path');
let express = require('express');
let app = express();    //initialize express
app.use(express.static(path.join(__dirname, '../client')));

// integrate views, for use with error 404 page.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

//routes
let routes = require('./routes');
//uses "/" as route. Since we only have one route it makes sense
app.use('/', routes);

// 404
app.use((req, res, next) => {
    let err = new Error('Not found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        errorMessage: err.message,
        error: err
    });
});

// start the server on port 3000
let server = app.listen(3000, () => {
    console.log('Express server listening on port 3000');
})
let io = require('socket.io')(server); //construct a server on port 3000

// This was the purely Socket.io server. We have upgraded to express app.
// let Server = require('socket.io');   //label the import as "Server"
// let io = Server(3000);   //construct a server on port 3000
// console.log('SocketIO listening on port 3000');

/*********************************************
    Setting up the MongoDb Database
 ********************************************/
//linking mogo database
let mongo = require('mongodb').MongoClient;
let uri = "mongodb://divinquantx:091496Alex@ds044699.mlab.com:44699/codeweekend2016";

/*********************************************/
// gets imports
let Moniker = require('moniker');   //help us generate random user names
let _ = require('underscore');
let User = require('./user');   //indicates look in curr folder, look for "user"

//initializes the users dictionary
let users = {};

/*********************************************
    SOCKET HANDLER FUNCTIONS
 **********************************************/
io.on('connection', (socket) => {
    // on 'connection' we need to set some stuff up
    console.log('Got a new connection');

    //(ignore) TOY example that sends PING responds with PONG
    socket.on('PING', (data) => {
        console.log('Got a PING');
        socket.emit('PONG'); // reply with a PONG
    });

    /******* Handles a new Connection to Mongo Database *********/

    // open a connetion to the mongo database upon opening socket.
    mongo.connect(uri, function(err, db) {
        //replace the "codeweekend2016default" collection name with the name of the
        //collection you created on mongolab
        var collection = db.collection('codeweekend2016default')
        //return the 10 most recent messages, in sorted order.
        collection.find().sort({
            date: -1
        }).limit(10).toArray((err, array) => {
            if (err) return console.error(err);
            for (let i = array.length - 1; i >= 0; i--) {
                socket.emit('MESG', array[i]);
            }
        });
    });

    /******* Handles a new Chatter **********/

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


    /*********************    Handles MESG     **********************/

	socket.on('MESG', (data) => {
		let user = users[socket.id];
		console.log(':MESG - $<user.getName()}> ${data.message}');
		let message = {
			from: user.getName(),
			message: data.message
		};

        // Adds new messages to mongo database
        mongo.connect(uri, function(err, db) {
            let collection = db.collection('codeweekend2016default');
            collection.insert({
                date: new Date().getTime(),
                from: user.getName(),
                message: data.message
            }, function(err, o) {
                if (err) {
                    console.warn(err.message);
                } else {
                    console.log("chat message inserted into db: " + message);
                }
            });
        });

        //broadcast the message everywhere.
		io.emit('MESG', message);
	});

    /************   handles a name change ****************
  * Handles NAME
  * When a client tries to change their name
  * Data object contains:
  *   - newName
  */
    socket.on('NAME', (data) => {
        let user = users[socket.id];
        console.log(':NAME - <${user.getName()}> wants to change name to' +
            '<${data.newName}>');

        if (isUniqueName(data.newName)) {
            // successful name change
            console.log(
                ':NAME - <${user.getName()}> changed name to <${data.newName}>');
            user.setName(data.newName);
            io.emit('NAME', {
                user: user.toObj()
            });
        } else {
            // failure :(
            console.log(':ERROR - NON_UNIQUE_NAME');
            socket.emit('ERROR', {
                message: 'NON_UNIQUE_NAME'
            });
        }
    });

/********   Sends an image (specified by a url) to all clients  ********
 * Data object contains:
 *   - url
 */
socket.on('IMG', (data) => {
    let user = users[socket.id];
    console.log(`:IMG - <${user.getName()}> IMAGE @ ${data.url}`);

    let message = {
        from: user.getName(),
        message: `<img src="${data.url}" class="message-image">`
    };

    io.emit('MESG', message);
});

	/***********     handles a disconnet   ****************/
	socket.on('disconnet', () => {
		let user = users[socket.id];
		console.log(':LEFT- ${user.toString()})');
		//alternatively can use io.emit. Broadcasts LEFT event to everyone
		//so everyone can update their own user lists.
		socket.broadcast.emit('LEFT', {user: user.toObj()});
		delete users[socket.id];
	});
});


/*********************************************
    HELPER FUNCTIONS
 **********************************************/
/**
 * Sees if a name is unique
 * @param name The name to check
 * @return boolean true if the name is unique
 *
 * comment: seems like quite an inefficient algorithm. But for our purposes it
 * works. But when there are millions of users this will generate duplicate work
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
