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
	let state = req.query.state;
	let state_decoded = null;
	try {
		state_decoded = JSON.parse(state);
	} catch(err) {
		res.status(400).send({error: 'invalid JSON'});
		return;
	}
	// get the token from the code
	
	rsmartcar.get_token(code, secrets['id'], secrets['sec'], function (dataew6234, err3847) {
		if(err3847) {
			res.status(400).send({'error': 'cannot get token from code'});
			return;
		}
		let token = dataew6234['access_token']
		let refresh_token = dataew6234['refresh_token']
		rsmartcar.get("vehicles", token, function(data, error) {
			if(error) {
				res.status(400).send({'error': 'unable to fetch'});
				return;
			}
			if(data["paging"]["offset"] != 0) {
				res.status(400).send({'error': 'offset is nonzero'});
				return;
			}
			if(data["vehicles"].length > 1) {
				res.status(400).send({'error': 'too many vehicles'});
			}
			const vehicle_id = data["vehicles"][0];
			rsmartcar.vehicle(vehicle_id, "", token, function(data2, err) {
				if(err) {
					res.status(400).send({'error': 'could not fetch vehicle info'});
					return;
				}
				const car = {
					"token": token,
					"make": data2['make'],
					"year": data2['year'],
					"model": data2['model'],
					"created": new Date().getTime(),
					"last_modified": new Date().getTime(),
					"refresh_token": refresh_token,
				};
				cars[vehicle_id] = car; 
				res.send("<script>window.location.href = '/vid?vid=" + escape(vehicle_id) + "';</script>");
			});
		});
	});	
});

app.get('/vid', (req, res) => "");

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
