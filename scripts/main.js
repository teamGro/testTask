const URL = "http://164.90.161.80:3000/api/content";
const $appContainer = $("#app");
let isFirstLaunch = true;

const pathToIcons = {
	zip: "../img/zip-icon.png",
	epub: "../img/epub-icon.png",
	img: "../img/img-icon.png",
	file: "../img/file-icon.png",
};

async function getResponse(url = "") {
	try {
		let response = await fetch(url);
		response = await response.json();
		return response.children;
	} catch (error) {
		console.error(error);
	}
}

function renderList(data, parentElement) {
	let $list = $(document.createElement("ul"));

	let items = "";
	data.forEach((elem) => {
		let clsName = elem.children ? "item-close" : "";
		items += `
							<li class="${clsName} item" data-param-id="${elem.id}">
								<img src="${addIcon(elem.title)}" class="item-icon""/>
								<span>${elem.title}</span>
							</li>`;
	});

	$list.addClass("list-close list");
	parentElement.append($list.html(items));

	if (isFirstLaunch) {
		$list.find("li").each(function () {
			$(this).addClass("item-root");
			$list.addClass("list-root list-open").removeClass("list-close");
		});

		isFirstLaunch = false;
	} else {
		$list.slideDown("100", function () {
			$(this).addClass("list-open").removeClass("list-close");
		});
	}
}

function addIcon(content) {
	let result = "";
	let type = content.split(".");
	type = type[type.length - 1];

	switch (type) {
		case "zip":
			result = pathToIcons.zip;
			break;
		case "epub":
			result = pathToIcons.epub;
			break;
		case "jpg":
			result = pathToIcons.img;
			break;
	}

	return result;
}

getResponse(URL)
	.then((response) => {
		renderList(response, $appContainer);
		$(".list-root").on("click", async function (e) {
			let $target = $(e.target);

			if ($target.prop("tagName") != "LI") $target = $target.closest("li");

			if (!$target.hasClass("item-close")) return;

			if ($target.find("ul:first").hasClass("list-open")) {
				$target.find("ul:first").slideUp();

				$target.find("ul:first").addClass("list-close").removeClass("list-open");
				$target.removeClass("item-open");
				return;
			}

			if ($target.find("ul").length) {
				$target.find("ul:first").slideDown('100', function () {
					$(this).addClass("list-open");
					$(this).removeClass("list-close");
				});
				$target.removeClass("item-open");
			} else {
				let targetID = $target.attr("data-param-id");
				let response = await getResponse(`${URL}?dirId=${targetID}`);
				renderList(response, $target);
			}

			$target.addClass("item-open");
		});
	})
	.catch((err) => console.error(err));
