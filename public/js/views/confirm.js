define("ConfirmView",["jquery","backbone","text!../templates/confirm.html"],function(e,t,n){var r;return r=t.View.extend({initialize:function(){this.$el=e(n),this.el=this.$el[0],e(document.body).append(this.$el),this.$text=this.$el.find(".text"),this.$yes=this.$el.find(".yes"),this.$no=this.$el.find(".no")},events:{"click .yes":"yes","click .no":"no"},render:function(e,t){this.callback=t,this.$text.html(e.text),this.$yes.html(e.yes),this.$no.html(e.no),this.$el.fadeIn(500)},yes:function(){typeof this.callback=="function"&&this.callback(),this.$el.fadeOut(500)},no:function(){this.$el.fadeOut(500)}}),r})