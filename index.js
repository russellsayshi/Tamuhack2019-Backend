const express = require('express');
const fs = require('fs');
const app = express();
const reids = require("redis"),
	client = redis.createClient();
const smartcar = require("smartcar");
const port = 3000;

client.on("error", function (err) {
	console.log("Error " + err);
});

const secrets = JSON.parse(fs.readFileSync("secrets.txt"));
const client = new smartcar.AuthClient({
  clientId: secrets['id'],
  clientSecret: secrets['sec'],
  redirectUri: 'YOUR_CALLBACK_URI',
  scope: ['read_vehicle_info'],
  testMode: true, // launch the Smartcar auth flow in test mode
});

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/auth_token', function(req, res) {
	let code = req.query.code;
	let state_encoded = req.query.state;
	let state = null;
	try {
		state = JSON.parse(state_encoded);
	} catch(err) {
		res.status(500).send({error: 'invalid JSON'});
		return;
	}
	
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));