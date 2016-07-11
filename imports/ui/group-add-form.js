import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-add-form.html';
import './menu-item.js';

export const Menu = new Mongo.Collection(null);

Menu.insert({});

Template.groupAddForm.helpers({
	users() {
		return Meteor.users.find({});
	},
	menu() {
		return Menu.find({});
	}
});

Template.groupAddForm.events({
	'click .add-menu-item'() {
		Menu.insert({});
	},
	'submit .new-group'(event) { 
		event.preventDefault();

		const groupId = Random.id();

		const target = event.target;

		const logo = target.logo.value;
		const groupName = target.name.value;
		
		const owner = {
			userId: Meteor.userId(),
			username: Meteor.user().username
		};
		const participants = [owner];
		Meteor.call('users.updateGroup', owner.userId, groupId, groupName);

		const participantsDOM = target.participants.selectedOptions;
		
		for (var i = 0; i < participantsDOM.length; i++) {
			let participantId = participantsDOM[i].value;
			let participantUsername = Meteor.users.findOne(participantId).username;
			let participant = {
				userId: participantId,
				username: participantUsername
			};
			Meteor.call('users.updateGroup', participantId, groupId, groupName);
			participants.push(participant);
		}

		const menu = [];
		const menuStarts = 3;
		const menuInputsCount = 3;
		for (i = menuStarts; i < target.length - 1; i += menuInputsCount) {
			let menuItem = {
				meal: target[i].value,
				price: target[i + 1].valueAsNumber,
				couponAvailable: target[i + 2].checked
			};
			menu.push(menuItem);
		}

		console.log(menu);

		Meteor.call('groups.insert', groupId, logo, groupName, participants, menu);

		target.logo.value = '';
		target.name.value = '';
	}
});     