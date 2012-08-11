// topics
// by Daniel Rodríguez
// MIT Licensed

const crypto = require('crypto')

var app
  , db
  , controller = {}
  , sendError


module.exports = function(_app) {
  app = _app
  db  = app.server.set('db')
  sendError = app.utils.sendError
  return controller
}


// Load Current User in JSON format
// if ?loop= then do this with long polling
// /api/1/user
controller.get_current = function(req, res) {

  // Started is set to 1
  // when the user just want to know the current
  // state before poping up the twitter login.
  var loop = req.query.loop
    , res_user = {}
    , sess  = req.session
    , sess_id = sess.id
    , ses_user
    , count = 0

  if (sess.user) {
    checkUser(null, sess)
  } else {
    req.sessionStore.get(sess_id, checkUser)
  }

  function checkUser(err, sess) {
    if (sess && sess.user) {
      ses_user = sess.user
      req.session.user = ses_user // Because it was somehow removing the user from the session
      res_user.user_id     = ses_user.user_id
      res_user.screen_name = ses_user.screen_name
      res_user.stats       = ses_user.stats
      res.send(res_user)
    } else if(loop) {
      setTimeout(function() {
        req.sessionStore.get(sess_id, checkUser)
      }, 1000)
    } else {
      res.send(res_user)
    }
  }

}


// Delete Current User
// just destroy the session
// /api/1/user
controller.destroy_session = function(req, res) {
  req.session.regenerate(function() {
    res.send('{}')
  })
}
