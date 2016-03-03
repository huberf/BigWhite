//Getting all dependencies
var express = require('express.io');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.http().io()

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

//Setting up cookie use
app.use(cookieParser());

//Setting up session handling
app.use(session({secret: 's3cr3tsSh0uldB3K3pt'}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	res.render('pages/index');
});

io.sockets.on('connection', function(socket) {
  socket.on('update text', function( data ) {
    io.emit('text update', data['text']);
  });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});

