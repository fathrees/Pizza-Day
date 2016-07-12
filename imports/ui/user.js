import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Groups } from '../api/groups.js'

import './user.html';

Template.user.helpers({
	disabled() {
		//if specified group dosn't exist user is updated
		if (this.groupId) {
			if (!Groups.findOne(this.groupId)) {
				Meteor.call('users.update.group', this._id, null, null);
			}
		}
		if (this.groupId || this._id === Meteor.userId()) {
			return true;
		}
		return false;
	},
	group() {
		return this.groupName || '';
	},
	isOwner() {
		return this._id === Meteor.userId();
	}
});