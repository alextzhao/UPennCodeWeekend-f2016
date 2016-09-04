//defining simple variables for future use.
var infoColor = '#888888';
var errorColor = 'red';
var messageColor = '#000000';
var nameColor = 'blue';

var messagesAreHidden = false;

var formatMessage = function(user, message) {
	return '<span style="color: ' + nameColor + '">' +
		user + '</span>' + ': ' + message;
};

var postMessage = function(color, contents) {
	console.log("jquery is not ready yet");
}


$(function() {
	postMessage = function(color, contents) {
		$('<li><span style="color: ' + color + '">'
			+ contents + '</span></li>')
		.hide()
		.appendTo('#messages')
		.fadeIn(200);
	}

	$('#message-form').submit(function(event) {
		//cancels default web browser form-submit behavior
		event.preventDefault();

		//Uncomment postMessage to support client side only.
		//sendMessage sends the message through the server so everyone connected
		//to the server can view the message.
		if($('#message').val() !== '') {
			//postMessage('black', formatMessage('Me', $('#message').val()));
			//TODO: Where is the sendMessage Defined?
			sendMessage($('#message').val());
			$('#message').val('');
		}
	});

	// select the submit-button and defines what happens when
	// submit button is clicked.
	$('#submit-button').click(function(event) {
		$('#message-form').submit();
	});

	$('#clear-button').click(function(event) {
		$('#message').val('');
	});

	$('#toggle-hide').click(function(event) {
		if(messagesAreHidden) {
			$('#messages').show();
			messagesAreHidden = false;
			$('#toggle-hide').text('Hide messages');
		} else {
			$('#messages').hide();
			messagesAreHidden = true;
			$('#toggle-hide').text('Show messages');
		}
	})


	$('body').keypress(function(event) {
		console.log(event.which);

		if(event.which == 13) {
			$('#message-form').submit();
			event.preventDefault();
		}

	});
});
