import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
// import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  const instance = Template.instance();
  instance.state.set('add participants', false);
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
	}
});

Template.groupShowForm.events({
	'click .add-participants'() {
		const instance = Template.instance();
  		instance.state.set('add participants', true);
	},
	'click .user-option'() {
		const groupId = Template.parentData(0)._id;
		const participants = Template.parentData(0).participants;
		const groupName = Template.parentData(0).name;

		participants.push({
			userId: this._id,
			username: this.username
		});

		Meteor.call('groups.update', groupId, participants);
		Meteor.call('users.updateGroup', this._id, groupId, groupName);
	}
});     