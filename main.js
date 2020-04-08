// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const DataStore = require("./DataStore");

const fs = require("fs");
const os = require("os");

const RESOURCE_PATH = os.tmpdir();

let mainWindow;

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile("index.html");

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
}

app.allowRendererProcessReuse = true;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", main);

const itemsData = new DataStore();

function main() {
	loadData();

	ipcMain.on("print-to-pdf", (event) => {
		const pdfPath = path.join(RESOURCE_PATH, `${Date.now()}.pdf`);
		const win = BrowserWindow.fromWebContents(event.sender);
		win.webContents
			.printToPDF({
				printBackground: true,
			})
			.then((data) => {
				fs.writeFile(pdfPath, data, (error) => {
					if (error) console.log(error);
					shell
						.openExternal("file://" + pdfPath)
						.then(() => event.sender.send("wrote-pdf", pdfPath));
				});
			})
			.catch((error) => {
				console.log(error);
			});
	});

	let itemsWindow = null;
	ipcMain.on("add-item-window", () => {
		if (!itemsWindow) {
			itemsWindow = new BrowserWindow({
				width: 1080,
				height: 860,
				parent: mainWindow,
				webPreferences: {
					nodeIntegration: true,
					preload: path.join(__dirname, "add-item.js"),
				},
			});
			itemsWindow.loadFile("add-item.html");

			itemsWindow.on("closed", () => {
				itemsWindow = null;
			});
		}
	});

	ipcMain.on("add-item", (event, item) => {
		const updatedItems = itemsData.add(item).items;
		itemsWindow.send("items", updatedItems);
	});

	ipcMain.on("delete-item", (event, item) => {
		const updatedItems = itemsData.delete(item).items;
		itemsWindow.send("items", updatedItems);
	});

	ipcMain.on("get-items", (event) => {
		let items = itemsData.getAll().items;
		itemsWindow.send("items", items);
	});
}

function loadData() {
	if (itemsData.getAll().items.length === 0) {
		const json = require("./items.json");
		itemsData.addAll(json.items);
	}
}

module.exports.items = itemsData.getAll().items;
