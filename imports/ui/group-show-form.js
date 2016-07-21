import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function groupShowFormOnCreated() {
  this.state = new ReactiveDict();
});

Template.groupShowForm.helpers({
	addParticipants() {
		return Template.instance().state.get('add participants');
	},
	canChange() {
		const userId = Meteor.userId();
		return userId === this.owner || this.participants.some(e => e.userId === userId);
	},
	canCreateOrder() {
		return !this.orderStatus || this.orderStatus === 'delivered';
	},
	changeLogo() {
		return Template.instance().state.get('change logo');
	},
	changeNameDisabled() {
		return !Template.instance().state.get('change name');
	},
	coupon() {
		return !this.orderStatus || this.orderStatus === 'ordering' || this.orderStatus === 'delivered';
	},
	deliver() {
		return this.orderStatus === 'ordered';
	},
	delivered() {
		return this.orderStatus === 'delivering';
	},
	isOwner() {
		return this.owner === Meteor.userId();
	},
	isParticipant() {
		return this.participants.some(e => e.userId === Meteor.userId());
	},
	menu() {
		return 'delivering ordered'.indexOf(this.orderStatus) > -1 ? this.menu.filter(item => item.count > 0) : this.menu;
	},
	participantOrdered() {
		return Meteor.user().order.groupId;
	},
	showCount() {
		return this.participants.some(e => e.userId === Meteor.userId()) && this.orderStatus === 'ordering' && !Meteor.user().order.groupId
			||  this.orderStatus === 'ordered' ||  this.orderStatus === 'delivering';
	},
	users() {
		return Meteor.users.find({});
	},
});

Template.groupShowForm.events({
	'click .add-menu-item'(event, instance) {
  		const menu = this.menu.slice();
  		menu.push({});
  		Meteor.call('groups.update.menu',this._id, menu);
	},
	'click .add-participants'(event, instance) {
  		const state = instance.state.get('add participants');
  		instance.state.set('add participants', !state);
	},
	'click .cancel-change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', false);
	}, 
	'click .change-logo'(event, instance) {
  		event.preventDefault();
  		instance.state.set('change logo', true);
	},
	'click .change-name'(event, instance) {
  		event.preventDefault();
  		const state = instance.state.get('change name');
  		instance.state.set('change name', !state);
	},
	'click .create-order'(event, instance) {
		event.preventDefault();
		Meteor.call('groups.update.orderStatus', this._id, 'ordering');
	},
	'click .deliver'(event) {
		event.preventDefault();
		// send e-mail
		Meteor.call('groups.update.orderStatus', this._id, 'delivering');
	},
	'click .delivered'(event) {
		event.preventDefault();
		const menu = this.menu.slice();
		menu.forEach(item => {
			item.count = 0;
			item.couponAdded = false;
		});
		Meteor.call('groups.update.orderStatus', this._id, 'delivered');
		Meteor.call('groups.update.menu', this._id, menu);
		this.participants.forEach(item => Meteor.call('users.update.order', item.userId, {}));
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
	'submit .show-group'(event, instance) {
  		event.preventDefault();
  		const userId = Meteor.userId();
  		if (this.owner === userId || this.participants.some(e => e.userId === userId)) { // if user is group's owner or participant
	  		const target = event.target;
	  		const ordering = this.orderStatus === 'ordering';
			const commonMenu = this.menu.filter(item => item.meal); // copy existing menu without empty items that could were created by 'click .add-menu-item'() above 
			Meteor.call('groups.update.menu', this._id, commonMenu); // update menu in DB without empty items

	  		let currentMenu = [];
	  		let menuStart = 1;
			let inputsCount = 3;
			
	  		if (this.owner === userId) { // save changes of logo and group's name
	  			menuStart = 3;
	  			if (!this.orderStatus || this.orderStatus === 'delivered') {
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
		  	if (ordering && !Meteor.user().order.groupId) {
		  		inputsCount++;
		  	}
		  	if (!this.orderStatus || this.orderStatus === 'delivered' || ordering && !Meteor.user().order.groupId) {
				for (let i = menuStart; i < target.length - 1; i += inputsCount) { // create current menu
					if (!target[i].value || ordering && !target[i + 3].valueAsNumber) {
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
					Meteor.call('users.update.order', userId, {
						groupId: this._id,
						order: currentMenu
					});
					if (this.participants.every(item => Meteor.users.findOne(item.userId).order.groupId)) {
						Meteor.call('groups.update.orderStatus', this._id, 'ordered');
					}
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

						return;
					}
				}
				if (currentMenu.length) {
					Meteor.call('groups.update.menu', this._id, currentMenu);
				}
			}
		}
	}
});     