define("TopicModel",["jquery","underscore","backbone"],function(e,t,n){var r;return r=n.Model.extend({urlRoot:"api/1/topic",idAttribute:"_id",defaults:{name:"",user_id:"",stats:{notes:0,visits:0}},validate:function(e){if(!e.name||e.name.length>140)return"Invalid Topic Name";if(!e.user_id)return"Invalid User ID"}}),r})