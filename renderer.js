const { ipcRenderer } = require("electron");

const fs = require("fs");

const printPDFButton = document.getElementById("print-pdf");

printPDFButton.addEventListener("click", function(event) {
	event.preventDefault();
	ipcRenderer.send("print-to-pdf");
});

ipcRenderer.on("wrote-pdf", function(event, path) {
	console.log(path);
	// document.getElementById("pdf-path").innerHTML = message;
});

const deleteItem = (e) => {
	ipcRenderer.send("delete-item", e.target.textContent);
};

document.getElementById("itemsBtn").addEventListener("click", () => {
	ipcRenderer.send("items-window");
});

// ipcRenderer.on("items", (event, todos) => {
// 	// get the todoList ul
// 	const todoList = document.getElementById("todoList");

// 	// create html string
// 	const todoItems = todos.reduce((html, todo) => {
// 		html += `<li class="todo-item">${todo}</li>`;

// 		return html;
// 	}, "");

// 	// set list html to the todo items
// 	todoList.innerHTML = todoItems;

// 	// add click handlers to delete the clicked todo
// 	todoList.querySelectorAll(".todo-item").forEach((item) => {
// 		item.addEventListener("click", deleteTodo);
// 	});
// });
