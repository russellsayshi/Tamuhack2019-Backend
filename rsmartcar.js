const request = require("request");

const base_smartcar_uri = "https://api.smartcar.com/v1.0/";
exports.get = function(url, token, callback) {
	request({
		headers: {
			'Authorization: Bearer {' + token + '}'
		},
		uri: base_smartcar_uri + url,
		method: 'GET'
	},
	function(err, res, body) {
		if(error) {
			callback({}, error)
			return;
		}
		callback(JSON.parse(body), false);
	});
}

exports.vehicle = function(vehicleid, param, token, callback) {
	exports.get("vehicles/" + vehicleid + "/" + param, token, callback);
}