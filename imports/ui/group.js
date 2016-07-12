import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group.html';
import './group-show-form.js';

Template.group.onCreated(function groupOnCreated() {
  this.state = new ReactiveDict();
  Template.instance().state.set('collapsedGroup', true);
});

Template.group.helpers({
	isOwner() {
		return this.owner === Meteor.userId();
	},
	collapsedGroup() {
		return Template.instance().state.get('collapsedGroup');
	}
});

Template.group.events({
	'click .del-group'() {
		const group = this;
		//remove this group from each user who is it's participant
		// this.participants.map((participant) => participant.userId).forEach((user) => {
		// 	console.log(user);
		// 	let groups = Meteor.users.findOne(user).groups;
		// 	groups.splice(groups.indexOf(group), 1);
		// 	Meteor.call('users.update.groups', user._id, groups);
		// 	return;
		// });
		Meteor.call('groups.remove', this._id);

	},
	'click .group'(event, instance) {
		instance.state.set('collapsedGroup', false);
	},
	'submit .show-group'(event, instance) {
		instance.state.set('collapsedGroup', true);
	}
});