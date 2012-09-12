// topics
// by Daniel Rodríguez <http://sadasant.com/>
// MIT Licensed

// router.js
// =========
//
// It is the main script for handling
// changes to the site's URL.
//
// There are basically 4 binded URLs:
//
// -   `/`, the home URI.
//
// -   `/connect`, where we connect with Twitter.
//
// -   `/logout`, where we check-out.
//
// -   `:screen_name/topic/:_id`, to show a user's topic.
//

define([
  'jquery'
, 'backbone'
, 'HomeView'
, 'ProfileView'
, 'FullTopicView'
, 'ConfirmView'
, 'UserModel'
, 'TopicModel'
], function($, B, HomeView, ProfileView, FullTopicView, ConfirmView, UserModel, TopicModel) {

  var Router
    , router
    , trigger     = { trigger : true }
    , replace     = { replace : true }
    , started     = false
    , confirmView = new ConfirmView()
    , User

  // Transmiting the confirm view within
  // other views because it never appears
  // twice in paralel within the hole site.
  ProfileView.setConfirmView(confirmView)
  FullTopicView.setConfirmView(confirmView)


  // The user is loaded after the login button is clicked,
  // once the server responses, we remove the homeView and
  // navigate back to the root URI to create the profileView
  function loadedUser() {
    var that = router
    started  = true
    if (that.homeView) {
      that.homeView.remove(function() {
        that.navigate('loading', replace)
        that.navigate('', trigger)
      })
    }
  }


  // ## Extending Backbone Router
  Router = B.Router.extend({
    routes : {
      ''        : 'home'
    , 'logout'  : 'logout'
    , ':screen_name/topic/:_id' : 'showTopic'
    }

    // ## Initializing the router
    // Once the page is loaded, the router starts.
    // First, it created the current user,
    // then it creates the views according to the
    // existing DOM structure.
  , initialize : function() {
      router = this
      User   = new UserModel({ _id : 'current' })
      if ($('#welcome')[0]) {
        this.homeView = new HomeView()
      }
      if ($('#profile')[0] && !~window.location.hash.indexOf('topic')) {
        this.profileView = new ProfileView({ model : User })
      }
      var $user = $('#JSONuser')
        , JSONuser
      if ($user[0]) {
        JSONuser = JSON.parse($user.val())
        User.set(JSONuser)
        loadedUser()
      }
    }

    // ## /
    // In the root URL (here we call it home),
    // the software first check if the call is been made
    // once the user is checked to be logged or not.
    // If it's not logged, it renders the home view.
    // If it's logged, it renders the profile view.
    // It also tries to clean other views that are
    // not currently needed.
  , home : function() {
      var user_id = User.get('user_id')
      if (!started) {
        return
      }
      if (!user_id) {
        if (!this.homeView) {
          this.homeView = new HomeView()
        }
        return this.homeView.render()
      }
      if (this.fullTopicView) {
        this.fullTopicView.remove()
      }
      if (!this.profileView) {
        delete this.homeView
        this.profileView = new ProfileView({ model : User })
        this.profileView.render()
      }
    }

    // ## /logout
    // This binding triggers the Backbone's Model's destroy
    // method, that sends a DELETE request to the server,
    // in which we destroy the current user's session.
  , logout : function() {
      if (!User.get('user_id')) {
        return this.navigate('', trigger)
      }
      var that = this
        , view = that.profileView ? 'profileView' : 'fullTopicView'
      User.destroy({
        success : function() {
          User.attributes = {}
          that[view].remove(function() {
            delete that[view]
            that.navigate('', trigger)
          })
        }
      , error : function(model, res, req) {
          console.log('ERROR', res)
        }
      })
    }

    // ## :screen_name/topic/:_id
    // This URI renders one of the topics by the
    // logged user, by the given parammeters (screen_name, _id),
    // no matter if there's no topics collection yet.
  , showTopic : function(screen_name, topic_id) {
      var that  = this
        , Topic
      if (!User.attributes.user_id) {
        that.navigate('', trigger)
      }
      function renderTopic() {
        that.fullTopicView = new FullTopicView({ model : Topic, topic_id : topic_id, user : User })
        that.fullTopicView.render()
      }
      function newTopic() {
        Topic = new TopicModel({ _id : topic_id })
        Topic.fetch({
          url     : '/api/1/' + screen_name + '/topic/' + topic_id
        , success : renderTopic
        , error   : function(model, res, req) {
            console.log('ERROR', res)
            that.navigate('', trigger)
          }
        })
      }
      if (this.profileView) {
        Topic = this.profileView.topics.where({ _id : topic_id })[0]
        this.profileView.remove(function() {
          delete that.profileView
          if (Topic) {
            renderTopic()
          } else {
            newTopic()
          }
        })
      } else {
        newTopic()
      }
    }

  })

  return Router

})
