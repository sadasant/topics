// topics
// by Daniel Rodríguez
// MIT Licensed

define('ProfileView', [
  'jquery'
, 'underscore'
, 'backbone'
, 'TopicsView'
, 'TopicModel'
, 'text!../templates/profile.html'
, 'jqueryColor'
], function($, _, B, TopicsView, TopicModel, tpl) {
  var ProfileView
    , confirmView
    , $newTopic
    , $loading
    , topics_url

  function createTopicView(that) {
    that.$topics      = that.$el.find('#topics')
    if (!topics_url) {
      topics_url      = 'api/1/' + that.model.attributes.screen_name + '/topics'
      that.topics.url = topics_url
    }
    if (that.$topics[0]) {
      that.topics     = new B.Collection()
      that.topics.url = topics_url
      that.topicView  = new TopicsView({
        collection  : that.topics
      , el          : that.$topics[0]
      , screen_name : that.model.attributes.screen_name
      })
    } else {
      delete that.$topics
    }
    return that
  }

  ProfileView = B.View.extend({
    el         : '#box'
  , initialize : function() {
      var $JSONtopics = $('#JSONtopics')
        , that        = this
      this.$profile   = this.$el.find('#profile')
      this.topics     = new B.Collection()
      // Downloading the templates only if they're needed
      this.template  = _.template(tpl)
      $loading  = $('#loading')
      $newTopic = $('.newTopic')
      if ($JSONtopics[0] && !~window.location.hash.indexOf('topic')) {
        this.JSONtopics = JSON.parse($JSONtopics.val())
        $JSONtopics.remove()
        $('#loading').fadeOut(500, function() {
          createTopicView(that).topics.add(that.JSONtopics)
        }).addClass('stop')
      }
    }
  , events : {
      'click .newTopic .new'     : 'addTopic'
    , 'keyup .newTopic .name'    : 'updateCount'
    , 'click #header .user .bye' : 'logout'
    }
  , render : function() {
      var $el = this.$el
        , that = this
        , locals = {
            user : this.model.attributes
          }
      if (!this.$profile[0]) {
        $el.hide().html(this.template(locals)).fadeIn(500, function() {
          $loading  = $('#loading')
          $newTopic = $('.newTopic')
          that.$profile = that.$el.find('#profile')
          if (!that.JSONtopics) {
            createTopicView(that).topics.fetch({
              success : function() {
                // Adding topics once tey're fetched
                $loading.fadeOut(500, function() {
                  that.topicView.renderAll()
                }).addClass('stop')
              }
            , error : function() {
                $loading.addClass('error')
              }
            })
          }
        })
      }
    }
  , addTopic : function() {
      var $field = $newTopic.find('.name')
        , $load  = $newTopic.find('.load')
        , $new   = $newTopic.find('.new')
        , topic  = $.trim($field.val())
        , that   = this
        , newTopic
      if (!topic || topic.length > 140) {
        $field
        .css('background-color', '#FCF8D0')
        .animate({
          backgroundColor : '#fff'
        }, 1000)
      } else {
        $new.hide()
        $load.removeClass('hide')
        $field.val('')
        this.updateCount()
        newTopic = new TopicModel({
          name    : topic
        , user_id : this.model.attributes.user_id
        })
        newTopic.save({ wait : true })
        newTopic.on('change', function() {
          createTopicView(that).topics.add(newTopic)
          $load.addClass('hide')
          $new.show()
        })
      }
    }
  , updateCount : function() {
      var length
      if (!this.$countSpan) {
        this.$countSpan = $newTopic.find('.count span')
      }
      if (!this.$newTopic) {
        this.$field = $newTopic.find('.name')
      }
      length = 140 - this.$field.val().length
      if (length < 0) {
        length = '<span style="color:red">' + length + '</span>'
      }
      this.$countSpan.html(length)
    }
  , logout : function(e) {
      e.preventDefault()
      // Make this a view?
      confirmView.render({
        text : 'Are you leaving now?'
      , yes  : 'Yes!'
      , no   : 'Nope'
      }, function() {
        window.location.hash = 'logout'
      })
    }
  , remove : function(callback) {
      var $el      = this.$el
        , $profile = this.$profile
      $el.fadeOut(500, function() {
        $profile.remove()
        $el.show()
        if (typeof callback === 'function') {
          callback()
        }
      })
    }
  })

  // HACK
  // Sharing a view between views
  ProfileView.setConfirmView = function(view) {
    confirmView = view
    TopicsView.setConfirmView(confirmView)
  }

  return ProfileView
})
