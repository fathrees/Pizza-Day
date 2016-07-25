import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';

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
		const logo = target.logo.files[0];
		const participantsDOM = target.participants.selectedOptions;
		let participants = [];
		
		for (let i = 0; i < participantsDOM.length; i++) {
			let participantId = participantsDOM[i].value;
			let participantUsername = Meteor.users.findOne(participantId).username;
			participants.push({
				userId: participantId,
				username: participantUsername
			});
		}

		let menu = [];
		const start = 3;
		const inputsCount = 3;
		for (i = start; i < target.length - 1; i += inputsCount) {
			if (!target[i].value) {
				continue;
			}
			menu.push({
				meal: target[i].value,
				price: target[i + 1].valueAsNumber,
				couponAvailable: target[i + 2].checked,
				count: 0
			});
		}

		const reader = new FileReader();
		reader.onload = event => {
			let bufferedLogo = reader.result;
			Meteor.call('groups.insert', groupId, bufferedLogo, groupName, participants, menu);
		}
		reader.readAsDataURL(logo);

		target.logo.value = '';
		target.name.value = '';
	}
});     