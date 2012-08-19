define("TopicsView",["jquery","underscore","backbone","text!../templates/topic.html","jqueryColor"],function(e,t,n,r){var i,s={"click .del":"remove"},o,u,a;return i=n.View.extend({initialize:function(n){t(this).bindAll("add"),this.collection&&(this.collection.bind("add",this.add),this.tags=[],a=n.screen_name,u=e("#loading")),this.template=t.template(r)},render:function(){return e(this.el).html(this.template({topic:this.model.attributes,user:{screen_name:a}})),this},add:function(e){var t=new i({model:e}),n=this;t.delegateEvents(s),this.tags[e.attributes._id]=t,u.before(t.render().el),e.id=e.attributes._id,e.urlRoot="api/1/"+a+"/topic",e.bind("delete",function(t){n.collection.remove(e),e.destroy({success:function(){t()},error:function(e,t,r){n.$el.find(".load").addClass("error"),console.log("ERROR",t)}})})},renderAll:function(){var e=this;t.each(this.collection.models,function(t){e.add(t)})},remove:function(){var e=this.$el,t=this;o.render({text:'Remove "<b>'+this.model.attributes.name+"</b>\" and all it's notes?",yes:"Yes!",no:"Nope"},function(){e.find(".del").hide(),e.find(".load").removeClass("hide"),t.model.trigger("delete",function(){e.fadeOut(100,function(){e.remove()})})})}}),i.setConfirmView=function(e){o=e},i})