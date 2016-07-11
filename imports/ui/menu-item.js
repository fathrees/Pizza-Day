import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Menu } from './group-add-form.js';

import './menu-item.html';


Template.menuItem.helpers({
	isCouple() {
		const group = Template.parentData(1);
		if (group) {
			console.log(group.menu.length);
			return group.menu.length > 1;
		}
		return Menu.find({}).count() > 1;
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