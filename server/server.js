(function()
{
var app;
var Iaftag;
var JsonMonster;
var Snippet;
var _;
init();
initDb();

/**************** DEFAULT INITIALIZATION *********************/
function init()
{
	var express = require('express');
	var cors = require('cors');
	var bodyParser = require('body-parser');
	var fs = require('fs');
	var path = require('path');
	_ = require('underscore-node');

	app = express();
	app.use(cors());
	app.set('port', process.env.PORT || 3000);
	app.use(bodyParser.json());

	
	app.listen(app.get('port'), function ()
	{
	    console.log('\nApp listening on port\n ' + app.get('port'));
	});
}

//*************** CONNECTING MONGOLAB DATABASE
function initDb()
{
	var options = {
		userMongoClient : true,
	    server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
	    replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
		};
	var mongoose = require('mongoose');
	Iaftag = require('./iaftagmodel.js');
	JsonMonster = require('./jsonmonstermodel.js');
	Snippet = require('./snippetmodel.js');
	var mongodbUri = 'mongodb://apreinders:mongolabOsiris74@ds011158.mlab.com:11158/db_apstraction';
	mongoose.connect(mongodbUri, options).then(function (db)
	{
		console.log("\ndb connection established...");
	});
}

function readFile()
{
	var filepath = path.join(__dirname,'./resources/general/pipe.json');
	fs.readFile(filepath,{encoding:'utf-8'}, function read(err, data)
	{
		addToJson(data);
	});

	function addToJson(jsonfile)
	{
		var obj = JSON.parse(jsonfile);
		for (var key in obj)
		{
			if(obj.hasOwnProperty(key))
			{
				//console.log("key",key);
				//console.log("value",obj[key]);
			}
		}
	}
}

/**********************  API URLS **********************************/
	app.get('/', function (req, res)
	{
	    res.send({message: "Get in touch with me via www.apstraction.nl"});
	});


	app.get('/json', function (req, res)
	{
		console.log("\ngetting json.........\n");
		Iaftag.find({}, function(err, data)
		{
			if(err)
			{
				console.log("error", err);
			}
			else			{
				var myjson = {}

				_.each(data,function(item, index)
				{
					myjson[item.classname] = item;
				});
				res.set('Content-type', 'application/json');
				res.status(200).send(myjson);
			}
		});
	});

	app.get('/snippets', function(req, res)
	{
		var param = req.query.resource;
		if (param.substring(param.length-4, param.length) == '.xml')
		{
			param = param.substring(0, param.length-4);
		}
		console.log("param: ", param);
		Snippet.find({name : param}, function (err, data)
		{

			if(err)
			{
				console.log("error", err);
				res.status(500).send({error: err});
			}
			else
			{
				var convert = require('xml-js');

				res.set('Content-Type', 'text/xml');
				res.status(200).send(convert.json2xml(data[0].xml));
			}
		});
	});
}());


// ds011158.mlab.com:11158/db_apstraction -u apreinders -p mongolabOsiris74 --authenticationDatabase "db_apstraction"
// mongoose.connect(mongodbUri, options);
// var conn = mongoose.connection;
// conn.on('error', console.error.bind(console, 'mongodb connection error:'));
// conn.once('open', function ()
// {
//     console.log('connection with mongodb established!');
// });

//setting these API urls to retrieve files directoy without stating an endpoint
	//app.use('/json', express.static(path.resolve(__dirname , 'resources/json')));
	//app.use('/snippets', express.static(path.resolve(__dirname , 'resources/snippets')));

// function getJsonMonster()
// {
// 	JsonMonster.findOne({}, function(err, data)
// 	{
// 		if(err)
// 		{
// 			console.log("error", err);
// 		}
// 		else
// 		{
// 			console.log("the data",data.json);
// 		}
// 	});
// }
