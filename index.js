var request = require('request');
var jsdom = require("jsdom");

var _triggerUpdateStateOnChange = true

function IPPower9258() {
	var self = this;
	
	this.updateState = function(newState, cb) {
	    newState = (typeof newState !== 'undefined') ?  newState : [false,false,false,false];

	    _triggerUpdateStateOnChange = false;

		for (var index=0; index<newState.length; index++) {
			self.state[index] = newState[index];
	    }
	    _triggerUpdateStateOnChange = true;
		
		var message = self._updateRequestMessage(self.state)
		
		self._sendRequest(message, function(error, response, html) {
		    if (cb) { cb(error); }
		});
	}
	
	this.fetchState = function(cb) {
		self._sendRequest(self._getRequestMessage(), 
			function(error, response, html) {
			if (error) {
			} else if (!response.statusCode == 200) {
			} else {
				jsdom.env(
					html,
					["http://code.jquery.com/jquery.js"],
					function (err, window) {
					   var inputs = window.$("input")
				   
						_triggerUpdateStateOnChange = false;
				   
					   for (var index=0; index<inputs.length; index++) {
						   var item = inputs[index]
						   var name = item.name
						   if ( !item.checked ) {
							   /* ignore */
						   } else if ( item.name.endsWith('_TC') ) {
							   /* ignore */
						   } else {
							   var state = item.value.toLowerCase() == 'on' ? 1 : 0
							   var idx = parseInt(name.replace(/^P6/,''))
							   self.state[idx] = state
						   }
					   }
				   
						_triggerUpdateStateOnChange = true;

						if (cb) { cb(error); }
					});
			}
		});
	}
	
	this.powerCycle = function(portNumber,offDelay,cb) {
	    offDelay = (typeof offDelay !== 'undefined') ?  offDelay : 5
		
		var state = self.state
		state[portNumber] = false
		
		var delayState = state.slice()
		delayState[portNumber] = true
		
		var delaySeconds = [0,0,0,0]
		delaySeconds[portNumber] = offDelay
		
		var message = self._updateRequestMessage(state,delayState,delaySeconds)
		
		self._sendRequest(message, 
						function(error, response, html) {
		    if (cb) { cb(error); }
		});
	}
	
	this._getRequestMessage = function() {
		var options = {
			url: 'http://' + self.config.ipAddress + '/iocontrol.htm',
			headers: self.config.headers
		};
		
		return options;
	}
	
	this._updateRequestMessage = function(state,delayState,delaySeconds) {
	    state = (typeof state !== 'undefined') ?  state : [false,false,false,false];
	    delayState = (typeof delayState !== 'undefined') ?  delayState : [false,false,false,false];
	    delaySeconds = (typeof delaySeconds !== 'undefined') ?  delaySeconds : [0,0,0,0];

	    var postRows = []
	    
		for (var index=0; index<state.length; index++) {
		    postRows.push('pw' + (index+1).toString() + 'Name=name');
		    postRows.push('P6' + (index).toString() + '=' + (state[index] ? 'On' : 'Off'));
		    postRows.push('P6' + (index).toString() + '_TS=' + parseInt(delaySeconds[index]));
		    postRows.push('P6' + (index).toString() + '_TC=' + (delayState[index] ? 'On' : 'Off'));
		}
		
		postRows.push('Apply=Apply');
		
		var postString = postRows.join('\r\n');
		
		var options = {
			method: 'POST',
			body: postString,
			url: 'http://' + self.config.ipAddress + '/tgi/iocontrol.tgi',
			headers: self.config.headers
		};
		
		return options;
	}

	this._sendRequest = function(options,cb) {
		request(options, function(error, response, html) {
		    if ( cb ) { cb(error, response, html); }
		});
	}
	
    var _defaultConfig = {
		headers: {
			'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'en-US,en;q=0.8',
			'Upgrade-Insecure-Requests' : 1,
			'Connection': 'keep-alive',
			'Content-Type': 'text/plain',
			'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		},
		ipAddress: '192.168.1.100',
		userName: 'admin',
		password: '12345678',
    };
	
	self.config = new Proxy(_defaultConfig, {
		get: function(target, prop) {
			return Reflect.get(target, prop);
		},
		set: function(target, prop, value) {
			var cookie = target.userName+'='+target.password+'; Taifatech=yes';
			target.headers['Cookie'] = cookie
			target.headers['Host'] = self.ipAddress;
			return Reflect.set(target, prop, value);
		}
	});
	
    var _defaultState = [false,false,false,false];
	
	self.state = new Proxy(_defaultState, {
		get: function(target, prop) {
			var getReturn = Reflect.get(target, prop);
			return getReturn
		},
		set: function(target, prop, value) {
		    var setReturn = Reflect.set(target, prop, value);

			if ( _triggerUpdateStateOnChange ) {
				self.updateState(self.state);
			} else {
				console.log('ignoring state change');
			}
			return setReturn;
		}
	});
}

module.exports = IPPower9258
