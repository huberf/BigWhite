//Getting all dependencies
var express = require('express.io');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.http().io()

var redis = require('redis');
var store = redis.createClient();
store.on("error", function (err) {
      console.log("Error " + err);
});

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

var id = 0;

var master = 0;

app.get('/', function(req, res) {
	  res.render('pages/index', {id: 'main', pageName: 'main'});
});


app.get('/:webId', function(req, res) {
  if (req.params.webId == 'main') {
    master = id + 1;
  }
	res.render('pages/index', {id: req.params.webId, pageName: req.params.webId});
});

var id = 0;

io.sockets.on('connection', function(socket) {
  id+=1;
  socket.on('begin', (data) => {
    store.get(data, (err, data) => {
      io.emit('new', [id, data]);
    });
  });
  socket.on('update text', function( data ) {
    store.set(data[2], data[1])
    if (data[2] == 'main') {
      console.log('Main detected');
      if(data[0] == master) {
        console.log('Master detected');
        io.emit('text update', data);
      }
    } else {
      io.emit('text update', data);
    }
  });
  socket.on('size update', function( data ) {
    io.emit('update size', data);
  });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port ', app.get('port'));
});

