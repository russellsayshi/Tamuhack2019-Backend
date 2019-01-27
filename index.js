const express = require('express');
const fs = require('fs');
const app = express();
const redis = require("redis");
const client = redis.createClient();
const request = require("request");
const rsmartcar = require("./rsmartcar.js");
const port = 80;

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
	
	rsmartcar.get_token(code, secrets['id'], secrets['sec'], function (get_token_data, get_token_err) {
		if(get_token_err) {
			res.status(400).send({'error': 'cannot get token from code'});
			return;
		}
		let token = get_token_data['access_token']
		console.log(get_token_data);
		let refresh_token = get_token_data['refresh_token']
		rsmartcar.get("vehicles", token, function(data, error) {
			if(error) {
				res.status(400).send({'error': 'unable to fetch'});
				return;
			}
			console.log("fetching vehicles. data: " + JSON.stringify(data));
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
					"messages": [],
					"longitude": 0,
					"latitude": 0,
				};
				cars[vehicle_id] = car; 
				res.send("<script>window.location.href = '/vid?vid=" + escape(vehicle_id) + "';</script>");
			});
		});
	});	
});

app.get('/message', function(req, res) {
	let car = cars[req.query.id];
	let content = req.query.content;
	let make = req.query.make;
	let longitude = req.query.long;
	let latitude = req.query.lat;

	// at some point we should validate this crap

	let candidates = [];
	
	for(const car_id of Object.keys(cars)) {
		let car = cars[car_id];
		if(car['make'] === make) {
			candidates.push(car_id);
		}
	}

	if(candidates.length == 0) {
		res.status(400).send({'error': 'cannot find any cars with matching make'});
		return;	
	}

	let best_score = Number.MAX_VALUE;
	let best_index = 0;
	for(let i = 0; i < candidates.length; i++) {
		const long_diff = longitude - cars[candidates[i]]['longitude'];
		const lat_diff = latitude - cars[candidates[i]]['latitude'];
		const score = Math.pow(long_diff * long_diff + lat_diff * lat_diff, .5);
		if(score < best_score) {
			best_score = score;
			best_index = i;
		}
	}

	cars[candidates[i]]['messages'].push(content);
	res.send("SUCCCess");
});

app.get('/set_location', function(req, res) {
	let id = req.query.id;
	
});

app.get('/vid', (req, res) => "");

app.get('/get_message', function(req, res) {
	let car = cars[req.query.id];
	if(car) {
		return JSON.stringify(car["messages"]);
	}
	res.status(400).send({error: 'invalid car'});
});

app.get('/get_info', function(req, res) {
	let car = cars[req.query.id];
	if(car) {
		return JSON.stringify(car["info"]);
	}
	res.status(400).send({error: 'invalid car'});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

