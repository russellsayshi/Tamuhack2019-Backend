const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/auth_token', function(req, res) {
	var code = req.query.code;
	
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));