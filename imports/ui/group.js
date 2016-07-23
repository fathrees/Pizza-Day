import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group.html';
import './group-show-form.js';

Template.group.onCreated(function groupOnCreated() {
  this.state = new ReactiveDict();
  this.state.set('collapsedGroup', true);
});

Template.group.helpers({
	isOwner() {
		return this.owner === Meteor.userId();
	},
	collapsedGroup() {
		return Template.instance().state.get('collapsedGroup');
	},
	waitOrder() {
		const user = Meteor.user();
		return this.participants.some(item => item.userId === user._id) && (!user.order || !user.order.groupId) && this.orderStatus === 'ordering';
	}
});

Template.group.events({
	'click .del-group'() {
		Meteor.call('groups.remove', this._id);
	},
	'click .group'(event, instance) {
		instance.state.set('collapsedGroup', false);
	},
	'submit .show-group'(event, instance) {
		instance.state.set('collapsedGroup', true);
	}
});