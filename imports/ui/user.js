import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './user.html';

Template.user.helpers({
	disabled() {
		const group = Template.parentData(1);
		return group && group.participants.some(item => item.userId === this._id);
	},
	isOwner() {
		return this._id === Meteor.userId();
	}
});