define(["jquery","backbone","HomeView","ProfileView","FullTopicView","ConfirmView","UserModel","TopicModel"],function(e,t,n,r,i,s,o,u){function v(){var e=f;h=!0,e.homeView&&e.homeView.remove(function(){e.navigate("loading",c),e.navigate("",l)})}var a,f,l={trigger:!0},c={replace:!0},h=!1,p=new s,d;return r.setConfirmView(p),i.setConfirmView(p),a=t.Router.extend({routes:{"":"home",logout:"logout",":screen_name/topic/:_id":"showTopic"},initialize:function(){f=this,d=new o({_id:"current"}),e("#welcome")[0]&&(this.homeView=new n),e("#profile")[0]&&!~window.location.hash.indexOf("topic")&&(this.profileView=new r({model:d}));var t=e("#JSONuser"),i;t[0]&&(i=JSON.parse(t.val()),d.set(i),v())},home:function(){var e=d.get("user_id");if(!h)return;if(!e)return this.homeView||(this.homeView=new n),this.homeView.render();this.fullTopicView&&this.fullTopicView.remove(),this.profileView||(delete this.homeView,this.profileView=new r({model:d}),this.profileView.render())},logout:function(){if(!d.get("user_id"))return this.navigate("",l);var e=this,t=e.profileView?"profileView":"fullTopicView";d.destroy({success:function(){d.attributes={},e[t].remove(function(){delete e[t],e.navigate("",l)})},error:function(e,t,n){console.log("ERROR",t)}})},showTopic:function(e,t){function s(){n.fullTopicView=new i({model:r,topic_id:t,user:d}),n.fullTopicView.render()}function o(){r=new u({_id:t}),r.fetch({url:"/api/1/"+e+"/topic/"+t,success:s,error:function(e,t,r){console.log("ERROR",t),n.navigate("",l)}})}var n=this,r;d.attributes.user_id||n.navigate("",l),this.profileView?(r=this.profileView.topics.where({_id:t})[0],this.profileView.remove(function(){delete n.profileView,r?s():o()})):o()}}),a})