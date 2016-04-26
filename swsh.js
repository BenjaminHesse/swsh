var rString = require("randomstring");
var sessionStorage = {};

exports.session = function(req, res, cb) {
	var sid;
	cleanUp();
	if(!(sid = lookUp(req))) sid = randomSid();
	sessionStorage[sid].expiration = (+new Date)+3600*3*1000;
	res.setHeader('Set-Cookie', 'NodeSID=' + sid + ';path=/;expires=' + cookieDate(sessionStorage[sid].expiration));
	req.session = sessionStorage[sid];
	cb(req, res);
}

var createSession = function(sid) {
	sessionStorage[sid] = {};
	sessionStorage[sid].id = sid;
	sessionStorage[sid].data = {};
	sessionStorage[sid].expiration = (+new Date)+3600*3*1000;
}

var lookUp = function(req) {
	var sid;
	if(req.headers.cookie && (sid = /NodeSID=([^ ,;]*)/.exec(req.headers.cookie))) {
		if(hasProp(sessionStorage, sid[1])) return sid[1];
	}
	return false;
}

var randomSid = function() {
	var sid;
	do {
		sid = rString.generate(12);
	} while(hasProp(sessionStorage, sid));
	createSession(sid);
	return sid;
}

var cleanUp = function() {
	var sid;
	var now = +new Date;
	for(sid in sessionStorage) {
		if(hasProp(sessionStorage, sid)) {
			if(sessionStorage[sid].expiration < now) delete sessionStorage[sid];
		}
	}
}


// Util
var hasProp = function(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

var cookieDate = function(ms) {
	var date, weekday, month;
  	date = new Date(ms)
  	weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  	month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  	return weekday[date.getUTCDay()] + ', ' + pad2D(date.getUTCDate()) + '-' + month[date.getUTCMonth()] + '-' + date.getUTCFullYear() + ' ' + pad2D(date.getUTCHours()) + ':' + pad2D(date.getUTCMinutes()) + ':' + pad2D(date.getUTCSeconds()) + ' GMT'
}

var pad2D = function(number) {
	if(number > 9) return number.toString();
	return '0' + number;
}