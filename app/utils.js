// topics
// by Daniel Rodríguez
// MIT Licensed

const crypto = require('crypto')

var utils = {}
  , secret

module.exports = function(_secret) {
  secret = _secret
  return utils
}


// ### sendError
// is used to log a message
// and response with an error
utils.sendError = function(code, msg, res) {
  console.log(msg)
  res.send(code || 500, {
    status : 'ERROR'
  , error  : msg.message || msg
  })
}


utils.encrypt = function(text) {
  var cipher  = crypto.createCipher('AES-128-CBC', secret.cypher_pass)
    , hex     = cipher.update(text, 'utf8', 'hex')
  return hex += cipher.final('hex')
}


utils.decrypt  = function(hex) {
  var decipher = crypto.createDecipher('AES-128-CBC', secret.cypher_pass)
    , utf8     = decipher.update(hex, 'hex', 'utf8')
  try {
    utf8 += decipher.final('utf8')
  } catch(e) {
    console.log(e)
  }
  return utf8
}
