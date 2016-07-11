import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group.html';
import './group-show-form.js';

Template.group.onCreated(function groupOnCreated() {
  this.state = new ReactiveDict();
  const instance = Template.instance();
  instance.state.set('collapsedGroup', true);
});

Template.group.helpers({
	isOwner() {
		return this.owner === Meteor.userId();
	},
	collapsedGroup() {
		const instance = Template.instance();
		return instance.state.get('collapsedGroup');
	}
});

Template.group.events({
	'click .del-group'() {
		Meteor.call('groups.remove', this._id);
	},
	'click .group'(event, instance) {
		instance.state.set('collapsedGroup', false);
	}
});