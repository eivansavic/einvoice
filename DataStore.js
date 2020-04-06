"use strict";

const Store = require("electron-store");

const NAME = "items";

class DataStore extends Store {
	constructor(settings) {
		super(settings);
		this.items = this.get(NAME) || [];
	}

	saveAll() {
		this.set(NAME, this.items);
		return this;
	}

	getAll() {
		this.items = this.get(NAME) || [];
		return this;
	}

	add(item) {
		this.items = [...this.items, item];
		return this.saveAll();
	}

	addAll(newItems) {
		this.items = [...this.items, ...newItems];
		return this.saveAll();
	}

	delete(item) {
		this.items = this.items.filter((t) => t !== item);
		return this.saveAll();
	}
}

module.exports = DataStore;
