// topics
// by Daniel Rodríguez <http://sadasant.com/>
// MIT Licensed

// main.js
// =======
//
// Here we define all the dependencies of our application.
// All of the libraries that doesn't have AMD support are
// customed to behave nicely with RequireJS.
//
// References: http://requirejs.org/docs/api.html#config
//
// Although I ended editing the code manually, If you need
// to adapt libraries to RequireJS, you can follow
// this example: <https://github.com/thomasdavis/backbonetutorials/tree/e7cb3c19c532b633832d6cd0ca4a0d55ba4750d0/examples/modular-backbone/js/libs/jquery>
//
//
// The libraries we're using are the following:
//
// -   **text**:
//     To require text files from our server.
//     In this case, all of them are template files.
//
// -   **jQuery**:
//     To handle the DOM in an easy way.
//
// -   **jQuery Color**:
//     To extend jquery's animations to handle colors.
//
// -   **Underscore**:
//     Because it's cool, it handles simple templates,
//     and it's needed by Backbone.
//
// -   **Backbone**:
//     Because MVC + Events + REST.
//
//
// Besides the mentioned libraries, there are some required
// modules structured by the Backbone paradigm.
//
// # Views
//
// -   **home**:
//     The first rendered view. It's the small box that
//     appears if the user is not logged in, which has
//     the "connect with Twitter" button at the bottom.
//
// -   **profile**:
//     Once the user has logged in, this view will appear.
//     It has the list of topics held by the connected user.
//
// -   **fulltopic**:
//     This view is shown if the logged user clicks one of
//     his/her toppics. It has all the topics' notes.
//
// -   **topics**:
//     This view is shown per topic inside the profile view.
//     It handles all the creation / deletion of topics authored
//     by the logged user.
//
// -   **notes**:
//     This view is shown per note inside the fulltopic view.
//     It handles all the creation / deletion / edition of
//     notes within the current topic, by the logged user.
//
// # Models
//
// -   **user**:
//     The user model, it works as a storage for the
//     current user's data, and also serves to delete
//     the current user (by restarting the server session).
//
// -   **topic**:
//     The topic model, it serves as a mold for topics,
//     also it works as a validator for new topics, and
//     as a handler for all the REST uri handling.
//
// -   **note**:
//     The note model, it serves as a mold for notes,
//     also it works as a validator for new topics, and
//     as a handler for all the REST uri handling.
//

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
