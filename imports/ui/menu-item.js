import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Menu } from './group-add-form.js';

import './menu-item.html';

function permissionToChange(group, userId) {
	return group && ~group.participants.map((e) => e.userId).indexOf(userId);
}

Template.menuItem.helpers({
	formId() {
		const group = Template.parentData(1);
		return group ? group._id : 'addGroup';
	},
	canDel() {
		return (permissionToChange(Template.parentData(1), Meteor.userId())) || Menu.find({}).count() > 1;
		
	},
	canEdit() {
		return permissionToChange(Template.parentData(1), Meteor.userId())
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