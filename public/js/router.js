// topics
// by Daniel Rodríguez
// MIT Licensed

define([
  'jquery'
, 'underscore'
, 'backbone'
, 'HomeView'
, 'ProfileView'
, 'fullTopicView'
, 'ConfirmView'
, 'UserModel'
, 'TopicModel'
], function(
  // Libs
  $, _, B

  // Views
, HomeView
, ProfileView
, fullTopicView
, ConfirmView

  // Models
, UserModel
, TopicModel
) {

  var Router
    , router
    , listsView   = {}
    , $body       = $('body')
    , trigger     = { trigger : true }
    , replace     = { replace : true }
    , started     = false
    , confirmView = new ConfirmView
    , User


  ProfileView.setConfirmView(confirmView)
  fullTopicView.setConfirmView(confirmView)

  function loadedUser() {
    var that = router
    started = true
    if (that.homeView) {
      that.homeView.remove(function() {
        that.navigate('loading', replace)
        that.navigate('', trigger)
      })
    }
  }

  // Extending Backbone Router
  Router = B.Router.extend({
    routes : {
      ''        : 'home'
    , 'connect' : 'connect'
    , 'logout'  : 'logout'
    , ':screen_name/topic/:_id' : 'showTopic'
    }
  , initialize : function() {
      router = this
      User = new UserModel({ _id : 'current' })
      if ($('#welcome')[0]) {
        this.homeView = new HomeView()
      }
      if ($('#profile')[0]) {
        this.profileView = new ProfileView({ model : User })
      }
      var that     = this
        , $user = $('#JSONuser')
        , JSONuser
      if ($user[0]) {
        JSONuser = JSON.parse($user.val())
        User.set(JSONuser)
        loadedUser()
      } else {
        User.fetch({
          success : loadedUser
        , error : function(model, res, req) {
            started = true
            console.log('ERROR', res)
          }
        })
      }
    }
  , home : function() {
      var locals
        , user_id = User.get('user_id')

      if (!started) return
      if (!user_id) {
        if (!this.homeView) {
          this.homeView = new HomeView()
        }
        this.homeView.render()
      } else
      // TODO:
      // Static fulltopic page?
      if ($('#fulltopic')[0] || !~window.location.hash.indexOf('/topic/')) {
        if (this.fullTopicView) {
          this.fullTopicView.remove()
        }
        this.profileView = new ProfileView({ model : User })
        this.profileView.render()
      } else {
        locals = {
          user   : User.attributes
        , topics : []
        }
        if (!this.profileView) {
          delete this.homeView
          this.profileView = new ProfileView({ model : User })
          this.profileView.render()
        }
      }
    }
  , connect : function() {
      if (this.profileView) {
        return this.navigate('', trigger)
      }
      var that = this
        , left = $(window).width() / 2 - 250

      // Mobile browsers doesn't like popups.
      if (window.is_mobile) {
        window.location.href = '/connect'
      } else {
        // Connecting with Twitter
        window.open('/connect?popup=1', 'sharer', 'width=500,height=300,top=150,left= ' + left + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1')
        User.fetch({
          loop : true
        , url  : User.url() + '?loop=1'
        , success : function() {
            that.homeView.remove(function() {
              that.navigate('', trigger)
            })
          }
        , error : function(model, res, req) {
            console.log('ERROR', res)
          }
        })
      }
    }
  , logout : function() {
      if (!User.get('user_id')) {
        return this.navigate('', trigger)
      }
      var that = this
      User.destroy({
        success : function() {
          User.attributes = {}
          that.profileView.remove(function() {
            delete that.profileView
            that.navigate('', trigger)
          })
        }
      , error : function(model, res, req) {
          console.log('ERROR', res)
        }
      })
    }
  , showTopic : function(screen_name, topic_id) {
      var that  = this
        , Topic

      // TODO: View topic without being the same user?
      if (!User.attributes.user_id) {
        that.navigate('', trigger)
      }
      if (this.profileView) {
        Topic = this.profileView.topics.where({ _id : topic_id })[0]
        if (Topic) {
          this.profileView.remove(function() {
            that.fullTopicView = new fullTopicView({ model : Topic, topic_id : topic_id, user : User })
            that.fullTopicView.render()
          })
        } else {
          Topic = new TopicModel({ _id : topic_id })
          Topic.fetch({
            url     : '/api/1/' + screen_name + '/topic/' + topic_id
          , success : function() {
              that.fullTopicView = new fullTopicView({ model : Topic, topic_id : topic_id, user : User })
              that.fullTopicView.render()
            }
          , error : function(model, res, req) {
              console.log('ERROR', res)
            }
          })
        }
      }
    }
  })

  return Router
})
