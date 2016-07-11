import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../api/groups.js';

import './group.js';
import './user.js';
import './group-add-form.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('groups');
  Meteor.subscribe('users');
});

Template.body.helpers({
	groups() {
		return Groups.find({}, {sort: {createdAt : -1} });
	},
	noGroups() {
		return Groups.find({}).count() === 0;
	},
	showAddForm() {
		const instance = Template.instance();
		return instance.state.get('showAddForm');
	}
});

Template.body.events({
	'click .add-group'(event, instance) {
		instance.state.set('showAddForm', true);
		
	},
	'click .hide-form'(event, instance) {
		instance.state.set('showAddForm', false);
	}
});     