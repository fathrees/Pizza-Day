import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Menu } from './group-add-form.js';

import './menu-item.html';


Template.menuItem.helpers({
	couple() {
		return Menu.find({}).count() > 1;
	}
});

Template.menuItem.events({
	'click .delete'() {
		Menu.remove(this._id);
	}
});