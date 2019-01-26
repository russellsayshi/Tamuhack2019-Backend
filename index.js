const express = require('express');
const app = express();
const reids = require("redis"),
	client = redis.createClient();
const port = 3000;

client.on("error", function (err) {
	console.log("Error " + err);
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
	request("
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));