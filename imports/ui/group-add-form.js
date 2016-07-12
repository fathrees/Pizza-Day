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
		const target = event.target;
		const groupId = Random.id();
		const groupName = target.name.value;
		const group = {
			groupId: groupId,
			groupName: groupName
		};
		const logo = target.logo.value;

// code for case when owner of created group is automatically its participant
		// const owner = {
		// 	userId: Meteor.userId(),
		// 	username: Meteor.user().username
		// };
		// const participants = [owner];
		// const groups = Meteor.user().groups;
		// groups.push(group);
		// Meteor.call('users.update.groups', owner.userId, groups);

		const participantsDOM = target.participants.selectedOptions;
		const participants = [];
		
		for (let i = 0; i < participantsDOM.length; i++) {
			let participantId = participantsDOM[i].value;
			let userDoc = Meteor.users.findOne(participantId);
			let participantUsername = userDoc.username;
			let participant = {
				userId: participantId,
				username: participantUsername
			};
			participants.push(participant);
			const groups = userDoc.groups || [];
			groups.push(group);
			Meteor.call('users.update.groups', participantId, groups);
		}

		const menu = [];
		const start = 3;
		const inputsCount = 3;
		for (i = start; i < target.length - 1; i += inputsCount) {
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
		Meteor.call('groups.insert', groupId, logo, groupName, participants, menu);

		target.logo.value = '';
		target.name.value = '';
	}
});     