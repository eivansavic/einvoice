"use strict";

const { ipcRenderer, remote } = require("electron");
const DataStore = require("./DataStore");

remote.getCurrentWebContents().once("dom-ready", load);

function load() {
	let items;

	ipcRenderer.send("get-items");

	ipcRenderer.on("items", function (event, loadedItems) {
		items = loadedItems;
		const itemList = document.getElementById("items-body");
		const itemItems = items
			.sort((item1, item2) => item1.code - item2.code)
			.reduce((html, item) => {
				html += `<tr class="${
					items.indexOf(item) % 2 === 0 ? "active" : "nonactive"
				}">
						<td>${item.code}</td>
						<td>${item.name}</td>
						<td>${item.price} RSD</td>
					</tr>`;
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

	document
		.getElementById("addItemForm")
		.addEventListener("submit", (event) => {
			event.preventDefault();
			event.stopImmediatePropagation();

			const codeInput = event.target[0];
			let code = codeInput.value;
			if (code.length === 0) {
				alert("Sifra je obavezna!");
				return;
			}

			code = parseInt(code);
			for (const item of items) {
				if (item.code == code) {
					alert("Uneta sifra vec postoji!");
					return;
				}
			}

			const nameInput = event.target[1];
			let name = nameInput.value;
			if (name.length === 0) {
				alert("Naziv je obavezan!");
				return;
			}

			const priceInput = event.target[2];
			let price = priceInput.value;
			if (price.length === 0) {
				price = 0;
			} else {
				price = parseFloat(price);
			}

			let item = {
				code,
				name,
				price,
			};
			ipcRenderer.send("add-item", item);

			codeInput.value = "";
			nameInput.value = "";
			priceInput.value = "";
		});
}
