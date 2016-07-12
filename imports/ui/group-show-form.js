import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
});

Template.groupShowForm.helpers({
	formId() {
		return this._id;
	},
	isOwner() {
		return this.owner === Meteor.userId();
	},
	isParticipant() {
		const userId = Meteor.userId();
		return ~this.participants.map((e) => e.userId).indexOf(userId);
	},
	addParticipants() {
		const instance = Template.instance();
		return instance.state.get('add participants');
	},
	users() {
		return Meteor.users.find({});
	},
	changeLogo() {
		const instance = Template.instance();
		return instance.state.get('change logo');
	},
	changeNameDisabled() {
		const instance = Template.instance();
		return !instance.state.get('change name');
	}
});

Template.groupShowForm.events({
	'click .add-participants'(event, instance) {
  		const state = instance.state.get('add participants');
  		instance.state.set('add participants', !state);
	},
	'click .user-option'() {
		const group = Template.parentData(0);
		const participants = group.participants;
		participants.push({
			userId: this._id,
			username: this.username
		});
		Meteor.call('groups.update.participants', group._id, participants);
		Meteor.call('users.update.group', this._id, group._id, group.name);
	},
	'click .change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', true);
	},
	'click .cancel-change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', false);
	}, 
	'click .change-name'(event, instance) {
  		event.preventDefault();
  		const state = instance.state.get('change name');
  		instance.state.set('change name', !state);
	},
	'click .add-menu-item'(event, instance) {
  		const menu = this.menu;
  		menu.push({});
  		Meteor.call('groups.update.menu',this._id, menu);
	},
	'submit .show-group'(event, instance) {
  		event.preventDefault();
  		
  		const target = event.target;
  		const menu = [];
		const inputsCount = 3;
  		let menuStart;
  		if (this.owner === Meteor.userId()) {
  			const newName = target.name.value;
  			const changedLogo = instance.state.get('change logo');

  			if (changedLogo) {
	  			const logo = target.logo.value;
	  			menuStart = 4;
	  			Meteor.call('groups.update.logo', this._id, logo);
	  		} else {
	  			menuStart = 3;
	  		}
	  		if (newName !== this.name) {
	  			Meteor.call('groups.update.name', this._id, newName);
	  		}
	  	} else {
	  		menuStart = 1;
	  	}
		for (let i = menuStart; i < target.length - 1; i += inputsCount) {
			if (!target[i].value) {
				continue;
			}
			let menuItem = {
				meal: target[i].value,
				price: target[i + 1].valueAsNumber,
				couponAvailable: target[i + 2].checked
			};
			menu.push(menuItem);
		}
		Meteor.call('groups.update.menu',this._id, menu);
	}
});     