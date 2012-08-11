// topics
// by Daniel Rodríguez
// MIT Licensed

var app
  , controllers = {}

module.exports = function(_app) {

  app = _app
  controllers.general = require('./controllers/general')(app)
  controllers.user    = require('./controllers/user'   )(app)
  controllers.topic   = require('./controllers/topic'  )(app)
  controllers.note    = require('./controllers/note'  )(app)

  // General Use
  app.server.get('/', controllers.general.index)

  // App Routes
  app.server.get('/connect'                      , controllers.general.connect)
  app.server.get('/connect/twitter/callback'     , controllers.general.twitter_callback)
  app.server.get('/:screen_name/topic/:topic_id' , controllers.general.public_topic)

  // JSON Api
  app.server.get ('/api/1/user/current'        , controllers.user.get_current)
  app.server.del ('/api/1/user/current'        , controllers.user.destroy_session)

  // Topics
  app.server.get ('/api/1/:screen_name/topic/:_id' , controllers.topic.get_topic)
  app.server.get ('/api/1/:screen_name/topics'     , controllers.topic.get_topics)
  app.server.post('/api/1/topic'                   , controllers.topic.create_topic)
  app.server.del ('/api/1/:screen_name/topic/:_id' , controllers.topic.delete_topic)
  app.server.put ('/api/1/:screen_name/topic/:_id' , controllers.topic.update_topic)

  // Notes
  app.server.get ('/api/1/:screen_name/topic/:topic_id/notes'     , controllers.note.get_notes)
  app.server.post('/api/1/note'                                   , controllers.note.create_note)
  app.server.del ('/api/1/:screen_name/topic/:topic_id/note/:_id' , controllers.note.delete_note)
  app.server.put ('/api/1/:screen_name/topic/:topic_id/note/:_id' , controllers.note.update_note)
}
