import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './user.html';

Template.user.helpers({
	disabled() {
		const group = Template.parentData(1);
		return group && group.participants.map((participant) => participant.userId).indexOf(this._id) > -1;
	},
	isOwner() {
		return this._id === Meteor.userId();
	}
});