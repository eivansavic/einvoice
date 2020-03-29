"use strict";

const { ipcRenderer } = require("electron");

document.getElementById("itemsForm").addEventListener("submit", (event) => {
	console.log("Opa");
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
