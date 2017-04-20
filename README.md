
# IPPower9258

Library to control IPPower9258 devices


## Example

```javascript
var IPPower9258 = require('ippower9258');
var ipPower = new IPPower9258()
ipPower.config.ipAddress = '192.168.0.101';

/* power cycle outlet 0 with off duration of 5s */
ipPower.powerCycle(0,5)

/* turn on outlet 1 */
ipPower.state[1] = true

/* turn off outlet 3 */
ipPower.state[3]
```


## License

This is free software; you can redistribute and/or modify it under the terms of the MIT Licence. See the LICENSE file for more information.

