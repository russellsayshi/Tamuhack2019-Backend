const request = require("request");
const btoa = require("btoa");

const base_smartcar_uri = "https://api.smartcar.com/v1.0/";
exports.get = function(url, token, callback) {
	console.log('Authorization: Bearer ' + token);
	request({
		headers: {
			'Authorization': 'Bearer ' + token
		},
		uri: base_smartcar_uri + url,
		method: 'GET'
	},
	function(err, res, body) {
		if(err) {
			callback({}, error)
			return;
		}
		callback(JSON.parse(body), false);
	});
}

exports.get_token = function(code, client_id, client_secret, callback) {
	console.log('Authorization: Basic ' + btoa(client_id));
        request({
		'headers': {
			'Authorization': 'Basic ' + btoa(client_id),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		'uri': 'https://auth.smartcar.com/oauth/token',
		'body': 'grant_type=authorization_code&code=' + code + '&redirect_uri=http://localhost/auth_token',
		'method': 'POST',	
	},
	function(err, res, body) {
		if(err) {
			callback({}, error);
			return;
		}
		callback(JSON.parse(body), false)
	});
}

exports.vehicle = function(vehicleid, param, token, callback) {
	exports.get("vehicles/" + vehicleid + "/" + param, token, callback);
}
