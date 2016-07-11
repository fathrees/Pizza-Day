import { Template } from 'meteor/templating';

import './participant.html';

Template.participant.helpers({
	isOwner() {
		return Template.parentData(1).owner === Meteor.userId();
	},
	isYourself() {
		return this.userId === Meteor.userId();
	}
});

Template.participant.events({
	'click .del-participant'() {
		const groupId = Template.parentData(1)._id;
		const participants = Template.parentData(1).participants;

		participants.splice(participants.indexOf(this), 1);

		Meteor.call('groups.update', groupId, participants);
		Meteor.call('users.updateGroup', this.userId, null, null);
	}
});