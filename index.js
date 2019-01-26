const express = require('express');
const fs = require('fs');
const app = express();
const redis = require("redis");
const client = redis.createClient();
const request = require("request");
const rsmartcar = require("./rsmartcar.js");
const port = 3000;

let cars = {};

client.on("error", function (err) {
	console.log("Error " + err);
});

const secrets = JSON.parse(fs.readFileSync("secret.txt"));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/auth_token', function(req, res) {
	let code = req.query.code;
	let state_encoded = req.query.state;
	let state = null;
	try {
		state = JSON.parse(state_encoded);
	} catch(err) {
		res.status(400).send({error: 'invalid JSON'});
		return;
	}
	rsmartcar.get("vehicles", code, function(data, error) {
		if(error) {
			res.status(400).send({error: 'unable to fetch'});
			return;
		}
		if(data["paging"]["offset"] != 0) {
			res.status(400).send({error: 'offset is nonzero'});
			return;
		}
		if(data["vehicles"].length > 1) {
			res.status(400).send({error: 'too many vehicles'});
		}
		res.send("<script>window.location.href = '/vid?vid=" + escape(data["vehicles"][0]) + "';</script>");
	});
});

app.get('/vid', (req, res) => return "");

app.get('/get_message', function(req, res) {
	var car = cars[req.query.car];
	if(car) {
		return JSON.stringify(car["messages"]);
	}
	res.status(400).send({error: 'invalid car'});
});

app.get('/get_info', function(req, res) {
	var car = cars[req.query.car];
	if(car) {
		return JSON.stringify(car["info"]);
	}
	res.status(400).send({error: 'invalid car'});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));