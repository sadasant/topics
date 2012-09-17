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

  function setSortableTopics(that) {
    var topics  = that.topics
      , $topics = $('ul#topics')
      , busy_sort = false
    function checkIfBusy() {
      if (busy_sort) {
        $topics.sortable('destroy')
      }
    }
    function updateSortedTopics(e, ui) {
      var $lis    = $topics.find('li.topic')
        , _ids    = [].map.call($lis, function(e){ return e.id.slice(7) })
        , $target = ui.item
        , $del    = $target.find('.del')
        , $load   = $target.find('.load')
      $del.hide()
      $load.removeClass('hide')
      busy_sort = true
      $.post(topics.url + '/sort', { positions : _ids }, function(data) {
        if (data.status === 'ok') {
          busy_sort = false
          $load.addClass('hide')
          $del.show()
        } else {
          $load.addClass('error')
        }
      })
      // TODO:
      // topics.sort()
    }
    $topics.sortable({
      opacity : 0.8
    , items   : '.topic'
    , cursor  : 'move'
    , start   : checkIfBusy
    , update  : updateSortedTopics
    })
  }

  ProfileView = B.View.extend({
    el         : '#box'
  , initialize : function() {
      this.$profile = this.$el.find('#profile')
      this.topics   = new B.Collection()
      this.template = _.template(tpl)
      $loading      = $('#loading')
      $newTopic     = $('.newTopic')
    }
  , events : {
      'click .newTopic .new'     : 'addTopic'
    , 'keyup .newTopic .name'    : 'updateCount'
    , 'click #header .user .bye' : 'logout'
    }
  , render : function() {
      var $el    = this.$el
        , that   = this
        , locals = {
            user : this.model.attributes
          }
      function renderProfile() {
        $loading        = $('#loading')
        $newTopic       = $('.newTopic')
        that.$profile   = that.$el.find('#profile')
        var $JSONtopics = $('#JSONtopics')
        if ($JSONtopics[0]) {
          that.JSONtopics = JSON.parse($JSONtopics.val())
          $JSONtopics.remove()
          $('#loading').fadeOut(500, function() {
            createTopicView(that).topics.add(that.JSONtopics)
            setSortableTopics(that)
          }).addClass('stop')
        } else {
          createTopicView(that).topics.fetch({
            success : function() {
              $loading.fadeOut(500, function() {
                that.topicView.renderAll()
                setSortableTopics(that)
              }).addClass('stop')
            }
          , error : function() {
              $loading.addClass('error')
            }
          })
        }
      }
      if (!this.$profile[0]) {
        $el.fadeOut(0, function() {
          $el.html(that.template(locals)).fadeIn(500, renderProfile)
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
