// topics
// by Daniel Rodríguez
// MIT Licensed

// Docs:
// - http://stackoverflow.com/questions/5651629/backbone-js-collections-and-views
define('TopicsView', [
  'jquery'
, 'underscore'
, 'backbone'
, 'text!../templates/topic.html'
], function($, _, B, tpl) {
  var TopicsViewClass
    , topicEvents = {
        'click .del' : 'remove'
      }
    , confirmView
    , $loading
    , user_screen_name

  TopicsViewClass = B.View.extend({
    initialize : function(params) {
      _(this).bindAll('add')
      if (this.collection) {
        this.collection.bind('add', this.add)
        this.tags        = []
        user_screen_name = params.screen_name
        $loading         = $('#loading')
      }
      this.template = _.template(tpl)
    }
  , render : function() {
      $(this.el).html(this.template({
        topic : this.model.attributes
      , user  : { screen_name : user_screen_name }
      }))
      return this
    }
  , add : function(topic) {
      var topicView = new TopicsViewClass({ model : topic })
        , that = this
      topicView.delegateEvents(topicEvents)
      this.tags[topic.attributes._id] = topicView
      $loading.before(topicView.render().el)
      topic.id = topic.attributes._id
      topic.urlRoot = 'api/1/' + user_screen_name + '/topic'
      topic.bind('delete', function(callback) {
        that.collection.remove(topic)
        topic.destroy({
          success : function(){
            callback()
          }
        , error : function(model, res, req) {
            that.$el.find('.load').addClass('error')
            console.log('ERROR', res)
          }
        })
      })
    }
  , renderAll : function() {
      var that = this
      _.each(this.collection.models, function(model) {
        that.add(model)
      })
    }
  , remove : function() {
      var $el  = this.$el
        , that = this
      confirmView.render({
        text : 'Remove "<b>' + this.model.attributes.name + '</b>" and all it\'s notes?'
      , yes  : 'Yes!'
      , no   : 'Nope'
      }, function() {
        $el.find('.del').hide()
        $el.find('.load').removeClass('hide')
        that.model.trigger('delete', function() {
          $el.fadeOut(100, function() {
            $el.remove()
          })
        })
      })
    }
  })

  // HACK
  // Sharing a view between views
  TopicsViewClass.setConfirmView = function(view) {
    confirmView = view
  }

  return TopicsViewClass
})
