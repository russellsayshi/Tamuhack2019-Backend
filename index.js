const express = require('express');
const fs = require('fs');
const app = express();
const redis = require("redis");
const client = redis.createClient();
const request = require("request");
const rsmartcar = require("./rsmartcar.js");
const port = 80;

//magic url: https://connect.smartcar.com/oauth/authorize?mode=test&response_type=code&client_id=5b33ca48-de7e-4619-965e-ecdd4af3d899&scope=read_vehicle_info%20read_location&redirect_uri=http://localhost/auth_token&state=%7B%22color%22%3A%20%22green%22%2C%20%22license%22%3A%20%225PX-7378%22%7D

let cars = {};

client.on("error", function (err) {
	console.log("Error " + err);
});

const secrets = JSON.parse(fs.readFileSync("secret.txt"));

app.get('/', (req, res) => res.send('Hello World!'));

//used to register this car
app.get('/auth_token', function(req, res) {
	console.log("auth token checkpoint 0");
	let code = req.query.code;
	let state = req.query.state;
	let state_decoded = null;
	try {
		state_decoded = JSON.parse(state);
	} catch(err) {
		console.log("fed bad json: " + state);
		console.log('reason: ' + err);
		res.status(400).send({error: 'invalid JSON'});
		return;
	}
	
	rsmartcar.get_token(code, secrets['id'], secrets['sec'], function (get_token_data, get_token_err) {
		console.log("auth token checkpoint 1");
		if(get_token_err) {
			res.status(400).end({'error': 'cannot get token from code'});
			return;
		}
		let token = get_token_data['access_token']
		console.log(get_token_data);
		let refresh_token = get_token_data['refresh_token'];
		rsmartcar.get("vehicles", token, function(data, error) {
			console.log("auth token checkpoint 2");
			if(error) {
				res.status(400).end({'error': 'unable to fetch'});
				return;
			}
			console.log("fetching vehicles. data: " + JSON.stringify(data));
			if(data["paging"]["offset"] != 0) {
				res.status(400).end({'error': 'offset is nonzero'});
				return;
			}
			if(data["vehicles"].length > 1) {
				res.status(400).end({'error': 'too many vehicles'});
				return;
			}

			//add this car to the list
			const vehicle_id = data["vehicles"][0];
			rsmartcar.vehicle(vehicle_id, "", token, function(data2, err) {
				console.log("auth token checkpoint 3");
				if(err) {
					res.status(400).end({'error': 'could not fetch vehicle info'});
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
				res.end("<script>window.location.href = '/vid?vid=" + escape(vehicle_id) + "';</script>");
				console.log("auth ended");
			});
		});
	});	
});

//called when a message is sent to the server
//TODO: add liscense plate matching functionality
app.get('/message', function(req, res) {
	let car = cars[req.query.id];
	let content = req.query.content;
	let make = req.query.make;
	let longitude = req.query.long;
	let latitude = req.query.lat;

	// at some point we should validate this crap
	let candidates = [];
	
	//linear search for matching makes
	//TODO: Match color, model too
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

	//find the closest car to our car
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
	//3 cs
	res.send("SUCCCess");
});

//set the location of this car in the database
app.get('/set_location', function(req, res) {
	let id = req.query.id;
	let longitude = req.query.long;
	let latitude = req.query.lat;
	cars[id]['longitude'] = longitude;
	cars[id]['latitude'] = latitude;
	res.send("SUCccess");
});

app.get('/vid', (req, res) => res.end(""));

//receive message from server
app.get('/get_message', function(req, res) {
	let car = cars[req.query.id];
	if(car) {
		return JSON.stringify(car["messages"]);
	}
	res.status(400).send({error: 'invalid car'});
});

//get the info for this car
app.get('/get_info', function(req, res) {
	let car = cars[req.query.id];
	if(car) {
		return JSON.stringify(car["info"]);
	}
	res.status(400).send({error: 'invalid car'});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

