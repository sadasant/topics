// topics
// by Daniel Rodríguez
// MIT Licensed

const crypto = require('crypto')

var app
  , db
  , controller = {}
  , sendError
  , Markdown


module.exports = function(_app) {
  app = _app
  db  = app.server.set('db')
  sendError = app.utils.sendError
  Markdown  = app.Markdown
  return controller
}


// Index
controller.index = function(req, res) {
  var view   = 'index'
    , user   = req.session.user
    , topics = []

  function foundUser(err, _user) {
    if (err || !_user) {
      console.log('Error finding user: ', user)
      req.session.regenerate()
      return done()
    }
    view = 'profile'
    db.topics.find({ user_id : user.user_id }, foundTopics)
  }

  function foundTopics(err, _topics) {
    if (err) {
      console.log('Error finding topics for user: ', user)
      return done()
    }
    var topic
      , i = 0

    for (; topic = _topics[i]; i++) {
      topics.push({
        _id     : app.utils.encrypt(topic._id.toString())
      , name    : topic.name
      , user_id : topic.user_id
      , stats   : topic.stats
      })
    }

    done()
  }

  function done() {
    var JSONuser = {}
    if (user && user._id) {
      JSONuser.user_id     = user.user_id
      JSONuser.screen_name = user.screen_name
      JSONuser.stats       = user.stats
    }
    res.render(view, {
      user       : user
    , JSONuser   : JSON.stringify(JSONuser)
    , JSONtopics : JSON.stringify(topics)
    })
  }

  if (user && user._id) {
    db.users.findOne({ _id : user._id }, foundUser)
  } else {
    return done()
  }

}


// Connecting to Twitter
// /connect
controller.connect = function(req, res) {

  // If popup is true is because
  // it was called as a window.open
  // from backbone, so the view
  // must close itself.
  req.session.popup = req.query.popup

  if (req.session.user) {
    // The User is already logged
    return res.render('connect', {
      popup : req.session.popup
    })
  }

  function gotOAuthRequestToken(err, token, secret) {
    if (err) {
      return sendError(500, err, res)
    }
    req.session.oauth = {
      token  : token
    , secret : secret
    }
    res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + token)
  }

  app.oa.getOAuthRequestToken(gotOAuthRequestToken)

}


// Twitter's Callback
// /connect/twitter/callback
controller.twitter_callback = function(req, res) {
  var oauth
    , user = req.session.user
    , result
    , s = {}

  if (!req.session.oauth) {
    return sendError(403, 'FORBIDDEN', res)
  }
  req.session.oauth.verifier = req.query.oauth_verifier
  oauth = req.session.oauth

  function gotAccessToken(err, token, secret, _result) {
    result = _result
    if (err || !result || !result.user_id) {
      return sendError(401, err, res)
    }
    req.session.oauth.token = token
    req.session.oauth.secret = secret

    if (user && user.twitter.user_id === result.user_id) {
      db.users.findOne({ _id : user._id }, foundUser)
    } else {
      db.users.findOne({ user_id : result.user_id }, foundUser)
    }
  }

  function foundUser(err, user) {
    if (err) {
      return sendError(500, err, res)
    }
    if (user) {
      // We have this user
      if (user.screen_name !== result.screen_name) {
        // If the user.screen_name has changed
        // save it
        user.screen_name = result.screen_name
        user.save(function(err) {
          if (err) {
            return sendError(500, err, res)
          }
          s.user = user
          done()
        })
      } else {
        // No differences, let's store the user
        s.user = user
        done()
      }
    } else {
      // We don't have this user yet
      db.users.create(req.session.oauth, result, function(err, user) {
        if (err || !user) {
          sendError(500, err, res)
        }
        s.user = user
        done()
      })
    }
  }

  function done(err) {
    if (err) {
      return sendError(500, err, res)
    }
    // Assigning directly gets removed somehow
    req.session.user = {
      _id         : s.user._id
    , user_id     : s.user.user_id
    , screen_name : s.user.screen_name
    , twitter     : s.user.twitter
    , stats       : s.user.stats
    }
    res.render('connect', {
      popup : req.session.popup
    })
  }

  app.oa.getOAuthAccessToken(oauth.token, oauth.secret, oauth.verifier, gotAccessToken)

}

// Public topic
// GET /:screen_name/topic/:topic_id
controller.public_topic = function(req, res) {
  var screen_name = req.params.screen_name
    , topic_id    = app.utils.decrypt(req.params.topic_id)
    , user
    , topic

  function foundUser(err, _user) {
    if (err || !_user) {
      return res.redirect('/')
    }
    user = _user
    db.topics.findOne({ _id : topic_id }, foundTopic)
  }

  function foundTopic(err, _topic) {
    if (err || !_topic) {
      return res.redirect('/')
    }
    topic = _topic
    db.notes.find({ topic_id : topic_id, user_id : user.user_id }, foundNotes)
  }

  function foundNotes(err, _notes) {
    if (err || !_notes) {
      return res.redirect('/')
    }
    var notes = []
      , note
      , i = 0

    // Sorting notes
    _notes = _notes.sort(function(a, b) {
      return a.position - b.position
    })

    for (; note = _notes[i]; i++) {
      notes.push({
        _id      : app.utils.encrypt(note._id.toString())
      , text     : note.text
      , parsed   : Markdown.parse(note.text)
      , user_id  : note.user_id
      , topic_id : note.topic_id
      })
    }

    res.render('fulltopic', {
      user  : user
    , topic : topic
    , notes : notes
    })
  }

  db.users.findOne({ screen_name : screen_name }, foundUser)

}
