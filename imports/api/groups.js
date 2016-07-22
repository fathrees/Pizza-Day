import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Email } from 'meteor/email'
import { check } from 'meteor/check';

export const Groups = new Mongo.Collection('groups');

if (Meteor.isServer) {
	Meteor.publish('groups', function groupsPublication() {
    	return Groups.find({});
  	});
  	Meteor.publish('users', function usersPublication() {
  		return Meteor.users.find({});
  	});
}

Meteor.methods({
	'groups.insert'(groupId, logo, name, participants, menu) {
		check(groupId, String);
		check(name, String);
		check(menu, Array);

		Groups.insert({
			logo, name, participants, menu,
			_id: groupId, 
			createdAt: new Date(),
			owner: this.userId,
			ownerName: Meteor.users.findOne(this.userId).username
		});
	},
	'groups.update.logo'(groupId, logo) {
		Groups.update(groupId, { $set: { logo: logo } });
	},
	'groups.update.name'(groupId, name) {
		Groups.update(groupId, { $set: { name: name } });
	},
	'groups.update.participants'(groupId, participants) {
		Groups.update(groupId, { $set: { participants: participants } });
	},
	'groups.update.menu'(groupId, menu) {
		Groups.update(groupId, { $set: { menu: menu } });
	},
	'groups.update.orderStatus'(groupId, orderStatus) {
		Groups.update(groupId, { $set: { orderStatus: orderStatus } });
	},
	'groups.remove'(groupId) {
		Groups.remove(groupId);
	},
	'users.update.order'(userId, order) {
		Meteor.users.update(userId, { $set: { order: order } });
	},
	'send.paricipant.email'(email, content) {
		Meteor.Mandrill.sendTemplate({
	        "template_name": email.template,
	        "template_content": [
	          {}
	        ],
	        "message": {
	            "global_merge_vars": [
	                {
	                    // name is the name you gave the variable in your template
	                    "name": "my",
	                    "content": content.my
	                },
	            ],

	            // Merge vars are per recipient and only needed when you send out
	            // one email to multiple users
	            "merge_vars": [
	              {}
	            ],
	            "to": [
	            {"email": email.receiver}
	            ]
	        }
	    });
	}
});   