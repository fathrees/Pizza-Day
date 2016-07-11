import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
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
		// check(participants, Array);
		check(menu, Array);
		//check(img, String); HOW TO CHECK FILE?

		Groups.insert({
			logo, name, participants, menu,
			_id: groupId, 
			createdAt: new Date(),
			owner: this.userId,
			ownerName: Meteor.users.findOne(this.userId).username
		});
	},
	'groups.update'(groupId, participants) {
		Groups.update(groupId, {
			$set: {
				participants: participants
			}
		});
	},
	'groups.remove'(groupId) {
		//HOW TO UPDATE ALL USERS, THAT ATTACHED TO GROUP IS REMOVED?
		//const toUpdate = Meteor.users.find({groupId: groupId});
		//const count = Meteor.users.find({groupId: groupId}).count();

		Groups.remove(groupId);
	},
	'users.updateGroup'(userId, groupId, groupName) {
		Meteor.users.update(userId, {
			$set: {
				groupId: groupId,
				groupName: groupName
			}
		});
	}
});   