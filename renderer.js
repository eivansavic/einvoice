const { ipcRenderer } = require("electron");
const fs = require("fs");

const DataStore = require("./DataStore");

const itemsData = new DataStore();
let items;

const printPDFButton = document.getElementById("print-pdf");

printPDFButton.addEventListener("click", function (event) {
	event.preventDefault();
	ipcRenderer.send("print-to-pdf");
});

ipcRenderer.on("wrote-pdf", function (event, path) {
	console.log(path);
	// document.getElementById("pdf-path").innerHTML = message;
});

ipcRenderer.on("reload-items", function (event, path) {
	loadItems();
});

document.getElementById("add-item-btn").addEventListener("click", () => {
	ipcRenderer.send("add-item-window");
});

function print_today() {
	var now = new Date();
	var months = new Array(
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	);
	var date = (now.getDate() < 10 ? "0" : "") + now.getDate();
	function fourdigits(number) {
		return number < 1000 ? number + 1900 : number;
	}
	var today =
		months[now.getMonth()] + " " + date + ", " + fourdigits(now.getYear());
	return today;
}

function roundNumber(number, decimals) {
	var newString; // The new rounded number
	decimals = Number(decimals);
	if (decimals < 1) {
		newString = Math.round(number).toString();
	} else {
		var numString = number.toString();
		if (numString.lastIndexOf(".") == -1) {
			// If there is no decimal point
			numString += "."; // give it one at the end
		}
		var cutoff = numString.lastIndexOf(".") + decimals; // The point at which to truncate the number
		var d1 = Number(numString.substring(cutoff, cutoff + 1)); // The value of the last decimal place that we'll end up with
		var d2 = Number(numString.substring(cutoff + 1, cutoff + 2)); // The next decimal, after the last one we want
		if (d2 >= 5) {
			// Do we need to round up at all? If not, the string will just be truncated
			if (d1 == 9 && cutoff > 0) {
				// If the last digit is 9, find a new cutoff point
				while (cutoff > 0 && (d1 == 9 || isNaN(d1))) {
					if (d1 != ".") {
						cutoff -= 1;
						d1 = Number(numString.substring(cutoff, cutoff + 1));
					} else {
						cutoff -= 1;
					}
				}
			}
			d1 += 1;
		}
		if (d1 == 10) {
			numString = numString.substring(0, numString.lastIndexOf("."));
			var roundedNum = Number(numString) + 1;
			newString = roundedNum.toString() + ".";
		} else {
			newString = numString.substring(0, cutoff) + d1.toString();
		}
	}
	if (newString.lastIndexOf(".") == -1) {
		// Do this again, to the new string
		newString += ".";
	}
	var decs = newString.substring(newString.lastIndexOf(".") + 1).length;
	for (var i = 0; i < decimals - decs; i++) newString += "0";
	//var newNumber = Number(newString);// make it a number if you like
	return newString; // Output the result to the form field (change for your purposes)
}

function update_price() {
	var row = $(this).parents(".item-row");
	var price = row.find(".cost").val() * row.find(".qty").val();
	price = roundNumber(price, 2);
	isNaN(price)
		? row.find(".price").html("N/A")
		: row.find(".price").html(price);

	update_total();
}

function update_total() {
	var total = 0;
	$(".price").each(function (i) {
		price = $(this).html();
		if (!isNaN(price)) total += Number(price);
	});

	total = roundNumber(total, 2);

	$("#total").html(total);
}

function bind() {
	$(".cost").blur(update_price);
	$(".qty").blur(update_price);
}

let index = 0;
let rowIndex = 0;
$(document).ready(function () {
	$("#print").click(function () {
		print();
	});

	$("input").click(function () {
		$(this).select();
	});

	$("#addrow").click(function () {
		index = index + 1;
		rowIndex = rowIndex + 1;
		let last = $(".item-row:last");
		let item = getRowItem(index, null);
		if (last.length > 0) {
			last.after(item);
		} else {
			$(".head-row:last").after(item);
		}

		if ($(".delete").length > 0) $(".delete").show();
		bind();
	});

	bind();

	$(".delete").live("click", function () {
		$(this).parents(".item-row").remove();
		update_total();
		index = index - 1;
		if ($(".delete").length == 0) $(".delete").hide();
	});

	$("#date").val(print_today());

	$(".tooltip-input").live("change", function () {
		let row = $(this).closest("tr");
		let value = $(this).val();

		let selectedItem;
		if (value && value.length > 0) {
			let filteredItems = items.filter(
				(item) => item.name === value.trim()
			);
			if (filteredItems.length > 0) {
				selectedItem = filteredItems[0];
			}
		}

		if (selectedItem) {
			let cost = roundNumber(selectedItem.price, 2);
			let price = roundNumber(cost * row.find("input.qty").val(), 2);
			row.find("span.tooltiptext").html(selectedItem.code);
			row.find("input.cost").val(cost);
			row.find("span.price").html(price);
			update_price();
		} else {
			row.find("span.tooltiptext").html("");
			row.find("input.cost").val("0.00");
			row.find("span.price").html("0.00");
			update_price();
		}
	});
});

function getRowItem(index, item) {
	loadItems();
	return `
				<tr class="item-row">
					<td class="item-code">
						<div class="delete-wpr">
							<input type="number" value="${index}"/>
							<a class="delete" href="javascript:;" title="Obriši">X</a>
						</div>
					</td>
					<td class="item-name">
						${getNameInput(item, index)}
					</td>
					<td class="item-cost"><input class="cost" type="number" value="${
						item ? item.price : "0.00"
					}"/></td>
					<td class="item-quantity"><input class="qty" type="number" value="1"/></td>
					<td class="item-price"><span class="price">0.00</span></td>
				</tr>
`;
}

function getNameInput(item, index) {
	const input = `
	<div class="tooltip"><input class="tooltip-input" title="" type="text" name="item" id="item-${rowIndex}" list="item-list-${index}" value="${
		item ? item.name : ""
	}">	
  <span class="tooltiptext"></span>
</div>`;
	let options = "";
	for (let item of items) {
		options = options + `\n<option value="${item.name}">`;
	}
	return (
		input +
		`<div class="scrolable-wrapper">
			<datalist id="item-list-${index}">
				<div class="scrolable">
					${options}
				</div>
			</datalist> 
		</div>`
	);
}

function loadItems() {
	items = itemsData.getAll().items;
}
