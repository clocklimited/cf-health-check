# cf-health-check

Manage health checks which determine the overall health of a service's dependencies.

[![dependency status](https://david-dm.org/clocklimited/cf-health-check.svg)](https://david-dm.org/clocklimited/cf-health-check) [![Greenkeeper badge](https://badges.greenkeeper.io/clocklimited/cf-health-check.svg)](https://greenkeeper.io/)

## Installation

```
npm install --save cf-health-check
```

## Usage

Register an async function that performs something you want to check.

```js

var healthCheck = new HealthCheck({ timeout: 5000 })

function checkConnection(cb) {
  serviceLocator.serviceDatabase.stats(function (err, stats) {
    cb(err, stats.ok === 1 ? 'OK' : 'Error')
  })
}

// Optional
function cleanFn() {
  // do something to clean up check.
}

healthCheck.register('critical'
  , { name: 'Database', description: 'Active connection to database', fn: checkConnection, cleanFn: cleanFn })


healthCheck.run(function (err, results) {
  // Process results
})
```

## Options

* timeout - Length of time each check is allowed before returning 'Timed out' status. (Default 10s)

## Credits
[Paul Serby](https://github.com/clocklimited/)

## License

ISC
