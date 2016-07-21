import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Menu } from './group-add-form.js';

import './menu-item.html';

Template.menuItem.onCreated(function menuItemOnCreated() {
	this.state = new ReactiveDict();
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
		return group && (group.owner === Meteor.userId() || group.participants.some(e => e.userId === Meteor.userId()))
			&& (!group.orderStatus || group.orderStatus === 'delivered') || Menu.find({}).count() > 1;	
	},
	canEdit() {
		const group = Template.parentData(1);
		return group && (group.owner === Meteor.userId() || group.participants.some(e => e.userId === Meteor.userId()))
			 && !Meteor.user().order.groupId;
	},
	orderCount() {
		const group = Template.parentData(1);
		return group && group.participants.some(e => e.userId === Meteor.userId())
			&& (group.orderStatus === 'ordering' && !Meteor.user().order.groupId
				|| group.orderStatus === 'ordered' || group.orderStatus === 'delivering');
	},
	ordered() {
		const group = Template.parentData(1);
		return group && (group.orderStatus === 'ordered' || group.orderStatus === 'delivering');
	},
	couponDisabled() {
		const group = Template.parentData(1);
		return group.owner !== Meteor.userId() || group.orderStatus === 'delivering';
	}
});

Template.menuItem.events({
	'click .add-coupon'(event) {
		const group = Template.parentData(1);
		const menu = group.menu.slice();
		menu.some(item => {
			if (item.meal === this.meal && item.price === this.price) {
				item.couponAdded = event.target.checked;
				return true;
			}
		});
		Meteor.call('groups.update.menu', group._id, menu);
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
	},
	'click .edit'(event, instance) {
		const state = instance.state.get('edit menu');
		instance.state.set('edit menu', !state);
	},
});