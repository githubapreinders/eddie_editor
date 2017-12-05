(function()
{
var app;
var Iaftag;
var fs;
var path;
var _;

/*
	Iaftag
	{
		"classname": "",
		"children" : [],
		"description": "",
		"attrs": {},
		"properties" : [],
		"xml" : ""
	}
*/

init();
initDb();

/**************** DEFAULT INITIALIZATION *********************/
function init()
{
	var express = require('express'); // basic API builder
	var cors = require('cors');// anticipate cross browser origin requests
	var bodyParser = require('body-parser');//easy post request handling
	require('body-parser-xml')(bodyParser);
	fs = require('fs');
	path = require('path');
	
	_ = require('underscore-node'); //convenience library

	app = express();
	app.use(cors());
	app.set('port', process.env.PORT || 3000);
	app.use(bodyParser.json());
	app.use(bodyParser.xml());
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
	var mongodbUri = 'mongodb://apreinders:mongolabOsiris74@ds011158.mlab.com:11158/db_apstraction';
	mongoose.connect(mongodbUri, options).then(function (db)
	{
		console.log("\ndb connection established...");
	});
}

/**********************  API URLS **********************************/
	app.get('/', function (req, res)
	{
		var filepath = path.join(__dirname,'./resources//landingpage.html');
		fs.readFile(filepath, {encoding :'utf-8'}, function read(err, data)
		{
			res.send(data);
		});
	});

/*
Retrieving the saved json file;
*/
	app.get('/json', function (req, res)
	{
		var filepath = path.join(__dirname,'./resources//datamonster.json');
		
						fs.readFile(filepath,{encoding:'utf-8'}, function read(err, data)
						{
							if(err)
							{
								res.status(500).send(err);
							}
							else
							{
								res.set('Content-type','application/json');
								res.status(200).send(data);
							}
						});
	});


/*returning the applicable schema document to validate against on the client side.*/
	app.get('/validate', function (req, res)
	{
		var filepath = path.join(__dirname,'./resources/schema.xsd');
		fs.readFile(filepath,{encoding:'utf-8'} , function read(err, data)
		{
			if(err)
			{
				res.status(500).send();
			}
			res.set('Content-type', 'application/xml');
			res.send(data);
		});
	});


/*
Retrieves the whole Iaftag collection from the db; a new object is created here
that contains them all. To easily iterate over a JSON object the underscore _.each method
is used. 
*/
function saveJson()
{
	var filepath = path.join(__dirname,'./resources/datamonster.json');
	Iaftag.find({}, function(err, data)
		{
			if(err)
			{
				console.log("error", err);
			}
			else			
			{
				var myjson = {};
				_.each(data,function(item, index)
				{
					myjson[item.classname] = item;
				});
			fs.writeFile(filepath , myjson, function(result)
			{
				console.log("file write result ", result);
			});
			}
		});
}




function saveXml(snippetname)
{
	var filepath = path.join(__dirname,'./resources/snippets/' + snippetname + '.xml');
	Iaftag.find({classname : snippetname}, function(err, data)
		{
			if(err)
			{
				console.log("error", err);
			}
			else			
			{
				var convert = require('xml-js');
				var contents = convert.json2xml(data[0].xml);

				fs.writeFile(filepath , contents, function(result)
				{
					console.log('write result',result);
				});
			}
		});
}

app.post('/convertXml',function (req, res)
{
	console.log("header", req.header('Content-type'), req.body);
	if(req.header('Content-type')=='application/xml')
	{
		console.log("alsdfkjfal");
		var thebody = [];
		req.on('data' , function(chunk)
		{
			thebody.push(chunk);
		}).on('end', function()
		{
			thebody = Buffer.concat(thebody).toString();
			console.log("body:", thebody);
		});


		//res.set('Content-type','application/json');
		//res.status(200).send(req.body);
	}
	else
	{
		console.log("convert xml fails....");
	}
});


app.post('/savesnippet', function(req, res)
{
	//console.log("savesnip", JSON.stringify(req.body.xml));
	var item = new Iaftag(req.body);
	item.save(function(err, result)
	{
		if(err)
		{
			console.log("server", err);
			res.status(500).send(err);
		}
		else
		{
			res.status(200).send('successfully saved snippet.');
			saveXml(req.body.classname);
		}
	});
});



/*
The content of a snippet is retrieved and converted to plain xml ; 
An example request looks like "http://localhost:3000/snippets?resource=HelloWorld";
This functionality can also be performed on the client side without a server call,
but then we will need the xml-js library there.
*/
	app.get('/snippets', function(req, res)
	{
		var param = req.query.resource;
		console.log("param: ", param);
		Iaftag.find({classname : param}, function (err, data)
		{

			if(err)
			{
				console.log("error", err);
				res.status(500).send({error: err});
			}
			else
			{
				if(data.length < 1 )
				{
					res.status(404).send();
					return;
				}
				var convert = require('xml-js');
				res.set('Content-Type', 'text/xml');
				res.status(200).send(convert.json2xml(data[0].xml));
			}
		});
	});

	function hashCode (str)
	{
	    var hash = 0;
	    if (str.length == 0) return hash;
	    for (i = 0; i < str.length; i++) 
	    {
	        char = str.charCodeAt(i);
	        hash = ((hash<<5)-hash)+char;
	        hash = hash & hash; // Convert to 32bit integer
	    }
    	return hash;
	}

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

// function readFile()
// {
// 	var filepath = path.join(__dirname,'./resources//datamonster.json');
// 	fs.readFile(filepath,{encoding:'utf-8'}, function read(err, data)
// 	{
// 		addToJson(data);
// 	});
// }

// 	function addToJson(jsonfile)
// 	{
// 		var obj = JSON.parse(jsonfile);
// 		for (var key in obj)
// 		{
// 			if(obj.hasOwnProperty(key))
// 			{
// 				//console.log("key",key);
// 				//console.log("value",obj[key]);
// 			}
// 		}
// 	}
// }
