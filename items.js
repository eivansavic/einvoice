"use strict";

const { ipcRenderer, remote } = require("electron");
const DataStore = require("./DataStore");

remote.getCurrentWindow().on("ready", () => {
	let items = [];

	ipcRenderer.send("get-items");

	ipcRenderer.on("items", function(event, items) {
		const itemList = document.getElementById("items");

		const itemItems = todos.reduce((html, todo) => {
			html += `<li class="item">${todo}</li>`;
			return html;
		}, "");

		itemList.innerHTML = itemItems;
		itemList.querySelectorAll(".item").forEach((item) => {
			item.addEventListener("click", deleteItem);
		});
	});

	const deleteItem = (e) => {
		ipcRenderer.send("delete-item", e.target.textContent);
	};

	document.getElementById("itemsForm").addEventListener("submit", (event) => {
		event.preventDefault();

		const idInput = event.target[0];
		const nameInput = event.target[1];
		const priceInput = event.target[2];

		ipcRenderer.send("add-item", {
			id: idInput.value,
			name: nameInput.value,
			price: priceInput.value
		});

		idInput.value = "";
		nameInput.value = "";
		priceInput.value = "";
	});
});
