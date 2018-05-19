var express = require("express");
var port = Number(process.env.PORT || 5000);
var fs = require('fs');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendFile( __dirname + '/public/index.html' );
});

app.listen(port, function() {
  console.log("Listening on " + port);
});
