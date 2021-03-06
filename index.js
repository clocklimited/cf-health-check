module.exports = HeathCheck

var async = require('async')
  , extend = require('lodash.assign')

function noop () {
}

function HeathCheck (options) {
  this.checks = []
  this.options = extend({ timeout: 10000 }, options)
}

HeathCheck.prototype.register = function (type, check) {
  type = type.toLowerCase()
  if (type === 'total') throw new Error('‘total’ is a reserved type')

  function checkWrapper (cb) {
    var start = Date.now()
      , timeout

    if (typeof check.cleanFn !== 'function') check.cleanFn = noop

    function buildResult (error, status) {
      var result = { type: type, name: check.name, description: check.description, status: 'Error' }
      if (error) {
        result.error = error.message
      } else {
        result.status = status
      }
      result.time = Date.now() - start
      return result
    }

    timeout = setTimeout(function () {
      timeout = null
      check.cleanFn()
      cb(null, buildResult(new Error('Check Timed Out')))
    }, this.options.timeout)

    check.fn(function (error, status) {
      if (timeout) {
        clearTimeout(timeout)
        check.cleanFn()
        cb(null, buildResult(error, status))
      }
    })
  }
  var returnFn = checkWrapper.bind(this)
  returnFn.type = type
  this.checks.push(returnFn)
}

HeathCheck.prototype.run = function (onlyType, cb) {
  var checks
  if (typeof onlyType === 'function') {
    cb = onlyType
    onlyType = null
    checks = this.checks
  } else {
    checks = this.checks.filter(function (check) {
      return check.type === onlyType
    })
  }

  async.parallel(checks, function (impossibleErr, results) {

    var returnResults = { results: {}, summary: { total: { fail: 0, pass: 0, count: 0 } } }
    results.forEach(function (result) {
      var type = result.type
      ; delete result.type

      if (returnResults.summary[type] === undefined) {
        returnResults.summary[type] = { fail: 0, pass: 0, count: 0 }
      }

      if (result.error === undefined) {
        returnResults.summary[type].pass += 1
        returnResults.summary.total.pass += 1
      } else {
        returnResults.summary[type].fail += 1
        returnResults.summary.total.fail += 1
      }

      returnResults.summary[type].count += 1
      returnResults.summary.total.count += 1

      if (returnResults.results[type] === undefined) {
        returnResults.results[type] = []
      }

      returnResults.results[type].push(result)

    })
    cb(null, returnResults)
  })
}
