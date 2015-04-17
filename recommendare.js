var express = require('express'),
	http = require('http'),
	path = require('path'),
	exphbs  = require('express3-handlebars'),
    mongoose   = require('mongoose'),
    bodyParser = require('body-parser'),
	config = require('./config.js').config,
	app = express();

//connect to MongoDB
mongoose.connect('mongodb://localhost:' + config.session.port + '/', config.mongoose_options);

//middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser())
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//routes
var routes_index = require('./routes/index');
app.use('/', routes_index);

//start app
app.listen(3000, function () {
	console.log('running...');
});
