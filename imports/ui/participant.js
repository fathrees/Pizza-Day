import { Template } from 'meteor/templating';

import './participant.html';

Template.participant.helpers({
	canDel() {
		const group = Template.parentData(1);
		return group.owner === Meteor.userId() && (!group.orderStatus || 'ordering delivered'.indexOf(group.orderStatus) > -1);
	},
	isYourself() {
		return this.userId === Meteor.userId();
	}
});

Template.participant.events({
	'click .del-participant'() {
		const group = Template.parentData(1);
		const participants = group.participants;
		participants.splice(participants.indexOf(this), 1);
		Meteor.call('groups.update.participants', group._id, participants);
	}
});