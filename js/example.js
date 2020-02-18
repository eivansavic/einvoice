let items = [];

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

function update_total() {
	let total = 0;
	$(".price").each(function(i) {
		price = $(this).html();
		if (!isNaN(price)) total += Number(price);
	});
	$("#total").html(total);
}

function update_price() {
	var row = $(this).parents(".item-row");
	var price = row.find(".cost").val() * row.find(".quantity").val();
	isNaN(price)
		? row.find(".price").html("N/A")
		: row.find(".price").html(price);

	update_total();
}

function bind() {
	$(".cost").blur(update_price);
	$(".quantity").blur(update_price);
}

$(document).ready(function() {
	loadJSON();
	
	for(const a of items) {
		console.log(a);
	}

	$("input").click(function() {
		$(this).select();
	});

	$(".add").live("click", function() {
		$(".item-row:last").after(
			'<tr class="item-row">\
			<td>\
			<div class="delete-wpr">\
				<div class="number">3</div>\
				<a class="delete" href="javascript:;" title="Remove row">X</a>\
			</div>\
			</td>\
			<td><div class="code">123</div></td>\
			<td class="item-name"><div>Poliranje</div></td>\
			<td><div>n/c</div></td>\
			<td><div class="cost">2300.00</div></td>\
			<td><div class="quantity">2</div></td>\
			<td><div class="price">4600.00</div></td>\
		</tr>'
		);
		if ($(".delete").length > 0) {
			$(".delete").show();
		}

		update_total(); 
		bind();
	});

	bind();

	$(".delete").live("click", function() {
		$(this)
			.parents(".item-row")
			.remove();
		update_total();
		if ($(".delete").length < 2) $(".delete").hide();
	});

	update_total();
});


function loadJSON() {   
	$.getJSON("/data/items.json", function( data ) {
		$.each( data, function( key, val ) {
			items.push( {
				"code": key,
				"name": val
			});
		});
	});
}