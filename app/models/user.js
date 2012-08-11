// topics
// by Daniel Rodríguez
// MIT Licensed

// Modules
const mongoose = require('mongoose')
    , Schema   = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , mailer   = require('nodemailer')

var app
  , User
  , db

module.exports = function(_app) {
  app = _app
  return User
}

User = new Schema({
  _id         : ObjectId
, user_id     : { type : String, index : true }
, screen_name : { type : String, index : true }
, oauth       : {
    token     : { type : String }
  , secret    : { type : String }
  }
, stats       : {
    topics    : { type : Number, default : 0 }
  , notes     : { type : Number, default : 0 }
  , visits    : { type : Number, default : 0 }
  }
, created_at  : { type : Date }
, updated_at  : { type : Date }
})

User.pre('save', function(next) {
  this.updated_at = new Date()
  next()
})

User.statics.create = function(oauth, result, callback) {
  var user
    , date = new Date()
    , smtp = mailer.createTransport("SMTP", app.secret.smtp)

  if (!db) db = app.server.set('db')

  user = new db.users({
      user_id     : result.user_id
    , screen_name : result.screen_name
    , oauth       : {
        token     : oauth.token
      , secret    : oauth.secret
      }
  , created_at : date
  , updated_at : date
  })

  user.save(savedUser)

  function savedUser(err) {
    if (err) return callback(err)
    var mail_options = {
      from    : "Topics " + app.secret.smtp.auth.user
    , to      : app.secret.mail_to
    , subject : "New User: @" + result.screen_name
    , html    : JSON.stringify(result)
    }

    smtp.sendMail(mail_options, sentMail)
  }

  function sentMail(err) {
    if (err) return callback(err)
    smtp.close()
    callback(null, user)
  }
}
