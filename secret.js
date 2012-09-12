// secrets.js
// ==================
//
// Here we store all the private values that are used by
// topics to authenticate with twitter, send emails and
// handle other information, such as sessions storage.
//


// Mongodb secrets
// ---------------
//

exports.mongo_url = 'mongodb://user:pass@stuffhere.mongolab.com:PORT/database'


// E-mail secrets
// --------------
//

exports.mail_to = 'you@you.me'

exports.smtp = {
  service : 'Email Provider'
, auth : {
    user : 'user@provider.com'
  , pass : 'password'
  }
}


// Twitter OAuth secrets
// ---------------------
//

exports.twitter = {
  consumer_key    : 'your key'
, consumer_secret : 'your secret'
, callback        : process.env.NODE_ENV === 'production' ? 'http://my.custom.url' : 'http://127.0.0.1:' + (process.env.app_port || process.env.PORT || 5000)
}


// Sessions secrets
// ----------------
//

exports.session   = 'session_secret'
