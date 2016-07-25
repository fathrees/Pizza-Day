import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import './group-show-form.html';
import './participant-email.html';
import './owner-email.html';
import './menu-item.js';
import './participant.js';

Template.groupShowForm.onCreated(function groupShowFormOnCreated() {
  this.state = new ReactiveDict();
});

Template.groupShowForm.helpers({
	addParticipants() {
		return Template.instance().state.get('add participants');
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
	deliver() {
		return this.orderStatus === 'ordered';
	},
	delivered() {
		return this.orderStatus === 'delivering';
	},
	isOwner() {
		return this.owner === Meteor.userId();
	},
	menu() {
		return 'delivering ordered'.indexOf(this.orderStatus) > -1 ? this.menu.filter(item => item.count > 0) : this.menu;
	},
	notOrdered() {
		return !this.orderStatus || this.orderStatus === 'ordering' || this.orderStatus === 'delivered';
	},
	canAddItem() {
		const user = Meteor.user();
		const isParticipant =  this.participants.some(e => e.userId === user._id);
		return (this.owner === user._id || isParticipant)
			&& (!this.orderStatus || this.orderStatus === 'delivered'
				|| this.orderStatus === 'ordering' && isParticipant && (!user.order || !user.order.groupId));
	},
	participantOrdered() {
		const user = Meteor.user();
		return this.participants.some(e => e.userId === user._id) && user.order && user.order.groupId;
	},
	showCount() {
		const user = Meteor.user();
		return this.orderStatus === 'ordering' && this.participants.some(e => e.userId === user._id) && (!user.order || !user.order.groupId)
			|| this.orderStatus === 'ordered' || this.orderStatus === 'delivering';
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
		const group = this;
		const order = group.menu.slice();
		const participants = group.participants.map(item => item.username);
		let total = 0;
		let discount = 0;
		order.forEach(item => {
			item.cost = item.price * item.count;
			total += item.cost;
			if (item.couponAdded) {
				discount += item.price;
			}
		});
		const email = {
			receiver: Meteor.user().email,
			template: 'ownerEmail'
		};
		const content = {
			username: group.ownerName,
			groupName: group.name,
			order: order,
			total: total,
			discount: discount,
			toPay: total - discount,
			participants: participants
		};
		//Meteor.call('send.owner.email', email, content);////////////////////Mandrill is undefined!!!!!!!!!!!!
		
		const participantsCount = group.participants.length;
		group.participants.forEach(user => {
			const paricipant = Meteor.users.findOne(user.userId);
			const order = paricipant.order.order ? paricipant.order.order.slice() : null;
			if (order) {
				const discount = (discount / participantsCount).toFixed(2);
				let total = 0;
				order.forEach(item => {
					item.cost = item.price * item.count;
					total += item.cost;
				});
				const email = {
					receiver: paricipant.email,
					template: 'participantEmail'
				};
				const content = {
					username: user.username,
					groupName: group.name,
					owner: group.ownerName,
					order: order,
					total: total,
					discount: discount,
					toPay: total - discount
				};
				// Meteor.call('send.paricipant.email', email, content);/Mandrill is undefined!!!!!!!!!!!!
			}
		});
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

	  		let hasOrder = Meteor.user().order;
	  		hasOrder = hasOrder && hasOrder.groupId;
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
		  			const reader = new FileReader();
					reader.onload = () => Meteor.call('groups.update.logo', this._id, reader.result);
					reader.readAsDataURL(target.logoShow.files[0]);
		  		}
	  			const newName = target.name.value;
		  		if (newName !== this.name) {
		  			Meteor.call('groups.update.name', this._id, newName);
		  		}
		  	}
		  	if (ordering && !hasOrder) {
		  		inputsCount++;
		  	}
		  	if (!this.orderStatus || this.orderStatus === 'delivered' || ordering && !hasOrder) {
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