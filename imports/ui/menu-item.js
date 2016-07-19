import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Menu } from './group-add-form.js';

import './menu-item.html';

Template.menuItem.onCreated(function menuItemOnCreated() {
	this.state = new ReactiveDict();
	this.permissionToChange = function(group, userId) {// is user groups owner or participant
		return group && (group.owner === userId || group.participants.map((e) => e.userId).indexOf(userId) > -1);
	};
});

Template.menuItem.helpers({
	formId() {
		const group = Template.parentData(1);
		return group ? group._id : 'addGroup';
	},
	disabled() {
		return Template.parentData(1) ? !Template.instance().state.get('edit menu') : false;
	},
	canDel() {
		const group = Template.parentData(1);
		return Template.instance().permissionToChange(group, Meteor.userId()) && group.orderStatus !== 'ordering' || Menu.find({}).count() > 1;
		
	},
	canEdit() {
		return Template.instance().permissionToChange(Template.parentData(1), Meteor.userId());
	},
	canOrder() {
		const group = Template.parentData(1);
		return group && group.participants.map((e) => e.userId).indexOf(Meteor.userId()) > -1 && group.orderStatus === 'ordering';
	}
});

Template.menuItem.events({
	'click .edit'() {
		const state = Template.instance().state.get('edit menu');
		Template.instance().state.set('edit menu', !state);
	},
	'click .delete'() {
		const group = Template.parentData(1);
		if (group) {
			const menu = group.menu.slice();
			menu.splice(menu.indexOf(this), 1);
			Meteor.call('groups.update.menu', group._id, menu);
		} else {
			Menu.remove(this._id);
		}
	}
});