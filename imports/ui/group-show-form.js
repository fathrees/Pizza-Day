import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
});

Template.groupShowForm.helpers({
	isOwner() {
		return this.owner === Meteor.userId();
	},
	addParticipants() {
		const instance = Template.instance();
		return instance.state.get('add participants');
	},
	users() {
		return Meteor.users.find({});
	},
	changeLogo() {
		const instance = Template.instance();
		return instance.state.get('change logo');
	},
	changeNameDisabled() {
		const instance = Template.instance();
		return !instance.state.get('change name');
	}
});

Template.groupShowForm.events({
	'click .add-participants'(event, instance) {
  		const state = instance.state.get('add participants');
  		instance.state.set('add participants', !state);
	},
	'click .user-option'() {
		const groupId = Template.parentData(0)._id;
		const participants = Template.parentData(0).participants;
		const groupName = Template.parentData(0).name;

		participants.push({
			userId: this._id,
			username: this.username
		});

		Meteor.call('groups.update.participants', groupId, participants);
		Meteor.call('users.update.group', this._id, groupId, groupName);
	},
	'click .change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', true);
	},
	'click .cancel-change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', false);
	}, 
	'click .change-name'(event, instance) {
  		event.preventDefault();
  		const state = instance.state.get('change name');
  		instance.state.set('change name', !state);
	}
});     