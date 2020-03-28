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
