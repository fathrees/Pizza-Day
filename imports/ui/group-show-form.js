import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function groupShowFormOnCreated() {
  this.state = new ReactiveDict();
  const orderStatus = this.data.orderStatus;
  this.state.set('can create order', !orderStatus || orderStatus === 'delivered');
});

Template.groupShowForm.helpers({
	isOwner() {
		return this.owner === Meteor.userId();
	},
	canChange() {
		const userId = Meteor.userId();
		return userId === this.owner || this.participants.map((e) => e.userId).indexOf(userId) > -1;
	},
	addParticipants() {
		return Template.instance().state.get('add participants');
	},
	users() {
		return Meteor.users.find({});
	},
	changeLogo() {
		return Template.instance().state.get('change logo');
	},
	changeNameDisabled() {
		return !Template.instance().state.get('change name');
	},
	canCreateOrder() {
		return Template.instance().state.get('can create order');
	},
	canOrder() {
		return this.participants.map((e) => e.userId).indexOf(Meteor.userId()) > -1 && this.orderStatus === 'ordering';
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
  		const menu = this.menu.slice();
  		menu.push({});
  		Meteor.call('groups.update.menu',this._id, menu);
	},
	'click .create-order'(event, instance) {
		event.preventDefault();
		instance.state.set('can create order', false);
		Meteor.call('groups.update.orderStatus', this._id, 'ordering');
	},
	'submit .show-group'(event, instance) {
  		event.preventDefault();
  		const userId = Meteor.userId();
  		if (this.owner === userId || this.participants.map((e) => e.userId).indexOf(userId) > -1) { // if user is group's owner or participant
	  		const target = event.target;
	  		const ordering = this.orderStatus === 'ordering';
			const commonMenu = this.menu.filter(item => item.meal); // copy existing menu without empty items that could were created by 'click .add-menu-item'() above 
			Meteor.call('groups.update.menu', this._id, commonMenu); // update menu in DB without empty items

	  		let currentMenu = [];
	  		let menuStart = 1;
			let inputsCount = 3;
			
	  		if (this.owner === userId) { // save changes of logo and group's name
	  			menuStart = 3;
	  			if (instance.state.get('can create order')) {
	  				menuStart++;
	  			}
	  			if (instance.state.get('change logo')) {
		  			menuStart++;
		  			Meteor.call('groups.update.logo', this._id, target.logo.value);
		  		}
	  			const newName = target.name.value;
		  		if (newName !== this.name) {
		  			Meteor.call('groups.update.name', this._id, newName);
		  		}
		  	}
		  	if (ordering) {
		  		inputsCount++;
		  	}
			for (let i = menuStart; i < target.length - 1; i += inputsCount) { // create current menu
				if (!target[i].value) {
					continue;
				}
				currentMenu.push({
					meal: target[i].value,
					price: target[i + 1].valueAsNumber,
					couponAvailable: target[i + 2].checked,
					count: ordering ? target[i + 3].valueAsNumber : 0
				});
			}

			if (ordering) {
				currentMenu = currentMenu.filter(item => item.count > 0); // create own user's order
				Meteor.call('user.update.order', userId, {
					groupId: this._id,
					order: currentMenu
				});
				console.log(currentMenu);
				if (commonMenu.length && currentMenu.length) { // update common order
					for (let i = 0; i < currentMenu.length; i++) { // compare each item from common menu with items of current user's menu
						let newItem;
						if (!commonMenu.some(common => { // if menu items of both menus are same increment order's count
							if (common.meal === currentMenu[i].meal && common.price === currentMenu[i].price) {
								common.count += currentMenu[i].count;
								common.couponAvailable = currentMenu[i].couponAvailable; // rewrite availability of coupon with last visited user's changes
								
								return true;
							}
						})) {
							commonMenu.push(currentMenu[i]);
						}
					}
					Meteor.call('groups.update.menu', this._id, commonMenu);
					console.log(commonMenu);

					return;
				}
			}
			if (currentMenu.length) {
				Meteor.call('groups.update.menu', this._id, currentMenu);
			}
		}
	}
});     