exports.mongo_url = 'mongodb_url'

exports.mail_to = 'mail_to'

exports.smtp = {
  service : "Gmail"
, auth : {
    user : "sender_mail"
  , pass : "sender_pass"
  }
}

exports.twitter = {
  consumer_key    : 'your key'
, consumer_secret : 'your secret'
, callback        : process.env.NODE_ENV === 'local' ? 'http://127.0.0.1:PORT' : ''
}

exports.session   = 'session_secret'

exports.cypher_pass = 'cypher_pass'
