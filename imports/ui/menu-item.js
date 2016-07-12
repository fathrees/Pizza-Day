import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Menu } from './group-add-form.js';

import './menu-item.html';

function permissionOnChange(group, userId) {
	
}

Template.menuItem.helpers({
	visible() {
		const group = Template.parentData(1);
		if (group) { //if template is opened in show-form
			const userId = Meteor.userId();
			if (~group.participants.map((e) => e.userId).indexOf(userId)) { //if current user is participant of viewed group
				return true;
			}
		}
		return Menu.find({}).count() > 1;
	},
	formId() {
		const group = Template.parentData(1);
		return group ? group._id : 'addGroup';
	}
});

Template.menuItem.events({
	'click .delete'() {
		const group = Template.parentData(1);
		if (group) {
			const menu = group.menu;
			menu.splice(menu.indexOf(this), 1);
			Meteor.call('groups.update.menu', group._id, menu);
		} else {
			Menu.remove(this._id);
		}
	}
});