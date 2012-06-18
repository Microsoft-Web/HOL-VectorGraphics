(function () {
	"use strict";
	var isInSaveMode = face.getUrlParam("isInSaveMode") === "1";

	$(function () {
		if (face.isSupportedBrowser) {
			initializeButtons();
			initializeDropZone();
			setHelpIconEvents();

			face.database.onopened(function () {
				face.pager.currentPage = 0;

				loadImages();
			});
		} else {
			alert("The File APIs are not fully supported in this browser.");
		}
	});

	function setHelpIconEvents() {
		$("#help_image").mousedown(function () {
			var src = "Images/Assets/help_disabled.png";
			$(this).attr("src", src);
		});

		$("#help_image").click(function () {
			var instructionPageName = "Default.htm";

			if ($("#pageFrame").attr("src") !== instructionPageName) {
				$("#pageFrame").attr("src", instructionPageName);
			}

			$(".page-container").toggleClass("instructions-page");
		});
	}

	function initializeDropZone() {
		face.dragAndDropManager.init("newGame",
			function () {
			},
			function (files) {
				if (files.length == 1 && files[0].type !== undefined && files[0].type.match('image.*')) {
					var f = files[0];

					var reader = new FileReader();
					reader.onload = function (e) {
						loadNewImage(e.target.result);
					};

					// Read in the image file as a data URL.
					reader.readAsDataURL(f);

				} else {
					alert('No file supported');
				}
			});
	}

	function loadNewImage(imageSrc) {
		var image = new Image();
		image.onload = function () {
			var newGameThumbnail = $("#newGame > .thumbnail");
			newGameThumbnail.empty();
			newGameThumbnail.append(this);
		};
		image.src = imageSrc;
	}


	function loadImages(callback) {
		initializePager(function () {
			var pager = face.pager;
			var from = pager.currentPage * pager.pageSize;
			var count = pager.pageSize;

			updatePagerDisplay();

			face.dragAndDropManager.removeDragAndDropEvents();

			var container = $("#mainSection");
			container.empty();

			var newGameElement = createGameElement(null, null, createNewGame).attr("id", "newGame");
			container.append(newGameElement);
			initializeDropZone();

			initializeForSave();

			if (!isInSaveMode) {
				face.imageManager.retrieveImages(from, count, function (imageName, image) {
					container.append(
						createGameElement(imageName, image, renameExistingGame).attr("data-image-name", imageName)
					);

					if (callback !== undefined) {
						callback();
					}
				});
			}
		});
	}

	function renameExistingGame(captionElement) {
		var game = $(captionElement).parent();
		var oldName = game.attr("data-image-name");
		var newName = $(captionElement).val();
		if (newName !== oldName && newName !== '') {
			face.imageManager.renameImage(oldName, newName, function () {
				game.attr("data-image-name", newName);
			});
		}
		else {
			$(captionElement).val(oldName);
		}
	}

	function createNewGame() {
		var newGameElement = $("#newGame");
		var imageData = newGameElement.find("img").attr("src");
		var name = newGameElement.find(".caption").val();
		face.imageManager.insertImage(name, imageData, function () {
			if (isInSaveMode) {
				imageHandler.isChanged = false;

				backToNewGame();
			} else {
				loadImages(function () {
					$(".game[data-image-name='" + name + "'] > .thumbnail").addClass("selected");
				});
			}
		});
	}

	function createGameElement(caption, image, rename) {
		var gameElement = $("<div />").addClass("game");
		var thumbnailElement = $("<div />").addClass("thumbnail");
		if (image !== null) {
			$(image).hover(function () {
				$("#mainSection").addClass("selection-mode");
				$(this).addClass("emphasis");
				$(this).parent().addClass("emphasis");
			});
			$(image).mouseout(function () {
				$(this).removeClass("emphasis");
				$(this).parent().removeClass("emphasis");
				$("#mainSection").removeClass("selection-mode");
			});
			thumbnailElement.append($(image).attr("alt", caption));
		}

		var captionElement = $("<input />").addClass("caption").val(caption);
		if (caption === null) {
			captionElement.attr("placeholder", "New Game");
		}

		if (rename !== undefined && rename !== null) {
			captionElement.blur(function () {
				rename(this);
			}).keypress(function (event) {
				if (event.which === 13) {
					rename(this);

					event.stopPropagation();
				}
			});
		}

		gameElement.append(thumbnailElement, captionElement);
		thumbnailElement.click(function () {
			$(".game > .thumbnail").removeClass("selected");
			$(this).addClass("selected");
		});
		thumbnailElement.mousedown(function () {
			$(this).removeClass("selected");
		});

		return gameElement;
	}

	function updatePagerDisplay() {
		var pager = face.pager;
		var totalPages = pager.getTotalPages();

		preparePagerButton("#backButton", pager.currentPage <= 0);
		preparePagerButton("#nextButton", pager.currentPage >= totalPages - 1);

		var pageLinks = $(".page-links");
		pageLinks.empty();
		pageLinks.removeClass("current");
		for (var i = 0; i < totalPages; i++) {
			var pageLink = $("<a />").addClass("page-link").text(i + 1);
			if (i === pager.currentPage) {
				pageLink.addClass("current");
			}
			pageLink.click(i, function (e) {
				var page = e.data;
				face.pager.currentPage = page;
				loadImages();
			});
			pageLinks.append(pageLink);
		}
	}

	function preparePagerButton(selector, hide) {
		var button = $(selector);
		if (hide) {
			button.addClass("hidden");
		} else {
			button.removeClass("hidden");
		}
	}

	function initializeButtons() {
		$("#backButton").click(function () {
			face.pager.currentPage = face.pager.currentPage - 1;
			loadImages();
		});

		$("#nextButton").click(function () {
			face.pager.currentPage = face.pager.currentPage + 1;
			loadImages();
		});

		$("#trashButton").click(function () {
			var game = $(".selected").parent(".game:not(#newGame)");
			if (game.length > 0) {
				var name = game.attr("data-image-name");
				face.imageManager.deleteImage(name, function () {
					loadImages();
				});
			}
		});

		$("#openButton").click(function () {
			openGame();
		});
	}

	function initializePager(callback) {
		face.imageManager.getImageCount(function (count) {
			var pager = face.pager;
			pager.totalItems = count + 1;
			if (callback !== undefined) {
				callback();
			}
		});
	}

	function initializeForSave() {
		if (isInSaveMode) {
			//Load Image from web storage and remove it from the storage
			var imageToSave = window.sessionStorage.getItem("ImageToSave");
			if (imageToSave !== undefined) {
				loadNewImage(imageToSave);

				window.sessionStorage.removeItem("ImageToSave");
			}

			$("#trashButton").click(function () {
				var game = $(".selected").parent(".game:not(#newGame)");
				if (game.length > 0) {
					var name = game.attr("data-image-name");
					face.imageManager.deleteImage(name, function () {
						loadImages();
					});
				}
			});

			$('#openButton').hide();
			$('#helpIcon').hide();
			$('#backIcon').show().click(backToNewGame);
		}
	}

	function openGame() {
		var game = $(".selected").parent(".game:not(#newGame)");
		if (game.length > 0) {
			var name = game.attr("data-image-name");
			var storage = window.sessionStorage;
			storage.setItem("gameId", name);
		}
		location.href = "NewGame.htm";
	}

	function backToNewGame() {
		if (window.parent !== undefined && window.parent.backToNewGame !== undefined) {
			window.parent.backToNewGame("save-as-page");
		}
	}
} ());
