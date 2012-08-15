// topics
// by Daniel Rodríguez
// MIT Licensed

require.config({
  paths: {
    text          : 'lib/text'
  , jquery        : 'lib/jquery'
  , jqueryColor   : 'lib/jquery.color'
  , underscore    : 'lib/underscore-amd'
  , backbone      : 'lib/backbone-amd'
  , app           : 'app'
  , router        : 'router'
  , HomeView      : 'views/home'
  , ProfileView   : 'views/profile'
  , FullTopicView : 'views/fullTopic'
  , TopicsView    : 'views/topics'
  , NotesView     : 'views/notes'
  , ConfirmView   : 'views/confirm'
  , UserModel     : 'models/user'
  , TopicModel    : 'models/topic'
  , NoteModel     : 'models/note'
  }
, shim: {
    backbone  : {
      deps    : ['underscore', 'jquery']
    , exports : 'backbone'
    }
  , underscore : {
      exports  : '_'
    }
  }
})

require(['app'], function(app) {

  app.init()

})
