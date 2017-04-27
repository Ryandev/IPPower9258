var IPPower9258 = require('./index.js');

var ipPower = new IPPower9258()

ipPower.config.ipAddress = '192.168.0.11';

console.log('Fetching state\n\n');

ipPower.fetchState(function(){
	ipPower.state[1] = true

	console.log({'state':ipPower.state})

	ipPower.powerCycle(1,5)

	setTimeout(function(){

		ipPower.fetchState(function(){
			console.log('Fetched state')

			console.log(JSON.stringify(ipPower.state));
	
			ipPower.updateState([false,false,false,false],function(){
				console.log('New state: ' + JSON.stringify(ipPower.state));
				ipPower.fetchState(function(){
					console.log('2.New state: ' + JSON.stringify(ipPower.state));

					ipPower.state[1] = true
			
					setTimeout(function(){
						console.log('3.New state: ' + JSON.stringify(ipPower.state));
						ipPower.state[1] = false
					},2000);
				});
			});
		});

	}, 6000);
});
