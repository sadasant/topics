// topics
// by Daniel Rodríguez
// MIT Licensed

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


// Shortcode function
// a slightly modified version of
// the original shortcode function
// for JS Bin written by Remy Sharp
utils.shortcode = function() {
  var vowels        = 'aeiou'
    , consonants    = 'bcdfghjklmnpqrstvwxyz'
    , i             = 0
    , l             = 7
    , word          = ''
    , letter
    , set

  for (; i < l; i += 1) {
    set    = (i%2 === 0) ? consonants : vowels
    letter = set[(Math.random() * set.length) >> 0]
    if (Math.random() * 2 >> 0) {
      letter = letter.toUpperCase()
    }
    word += letter
  }

  return word
}
