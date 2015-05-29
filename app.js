// Server Set Up ================================================================
var express = require('express');
var socketio = require('socket.io');

var app = express();
var router  = express.Router();
var server = require('http').createServer(app);
var io = socketio.listen(server);
var people = {};  

var bodyParser = require('body-parser');
var session = require('client-sessions');
var sess;



// Configuration ================================================================

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.use(session({
  cookieName: 'session',
  secret: 'portalSDMrealtime',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use(bodyParser.urlencoded({ extended: false }));




var mysql = require('mysql');
var TEST_DATABASE = 'psdm_v2';
var client = mysql.createConnection({
  host:'10.16.1.42',
  user: 'root',
  password: 'tralala',
});

client.connect();

client.query('USE '+TEST_DATABASE);

// Function

// function upload Front News
var uploadfnews = function(data, callback) {
	client.query("insert into news (id, type, subject, content, date_created, valid_date, created_by) values (?,?,?,?,?,?,?)", [data.id, data.type, data.subject, data.newscontent, data.datecreated, data.validdate, data.createdby], function(err, info) {
		// callback 
		if (err) {
			callback("error");
		}else{
			client.query("SELECT * FROM news WHERE date_created = ?", [data.datecreated], function(err, results, fields) {
				// callback 
				if (err) {
					console.log("ERROR: " + err.message);
					throw err;
				}

				callback(results);
			});
		}

	});
}




io.sockets.on('connection', function (socket) {

	socket.join('portalsdm');

	socket.on('check_in', function (incoming) {
		people[incoming.NIP] = {
		  "NIP":incoming.NIP,
		  "useronline":incoming.NAMA,
		  "socketID": socket.id
		};
		  console.log(people);
		  io.emit('newuseronline', people);
    });

	socket.on('check_out', function (incoming) {
		console.log(incoming+' has left the server');
		io.emit("update", people[socket.id] + " has left the server.");
		delete people[socket.id];
        io.emit("update-people", people);
	});

	//receiving chat
	socket.on('sending_chat', function (incomingChat) {
		console.log(people);
		console.log("Penerima : "+incomingChat.receiver+", Pesan : "+incomingChat.mess);
        //if (people[incomingChat.receiver].socket!=undefined){
		  //io.sockets.connected[people[incomingChat.receiver].socket].emit("private", incomingChat.mess);
		//io.to(people[incomingChat.receiver].socketID).emit('private', incomingChat.mess);
		//io.sockets.emit("private", people[incomingChat.receiver].socketID, incomingChat.mess);
		//} else {
		//  console.log("User does not exist: " + incomingChat.receiver); 
		//}
		people[incomingChat.receiver].socketID.emit('private', incomingChat.mess);
	});

	// upload front news
	socket.on('upload_frontnews', function (incoming) {
		uploadfnews(incoming, function(result) {
			io.emit('upload_frontnews_result', result);
			//console.log(result);
		});
	});


});

// Routes =======================================================================
require('./app/routes')(app,io,client,router);


module.exports = app;
module.exports = io;

server.listen(3333);
