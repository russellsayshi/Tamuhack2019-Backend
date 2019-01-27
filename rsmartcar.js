const request = require("request");

const base_smartcar_uri = "https://api.smartcar.com/v1.0/";
exports.get = function(url, token, callback) {
	request({
		headers: {
			'Authorization': 'Bearer {' + token + '}'
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
        request({
		'headers': {
			'Authorization': 'Basic base64(' + client_id + ":" +  client_secret + ")",
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
