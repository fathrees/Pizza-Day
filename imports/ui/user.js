import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Groups } from '../api/groups.js'

import './user.html';

Template.user.helpers({
	disabled() {
		// const group = Template.parentData(1);
		// if (group && );
	},
	isOwner() {
		return this._id === Meteor.userId();
	}
});