var NewGame = {};

(function () {
	"use strict";
	var imageHandler;
	var glassButtonPosition;

	$(function () {
		// Check for the various File API support.
		if (window.face !== undefined && window.face.isSupportedBrowser) {

			initLogo();

			initIconsTransitions();

			initImageHandler();

			initTopMenu();

			setHelpIconEvents();

			attachBottomButtonsEvents();

			attachIconEvents();

			initDropZone();

			initEventBrowseFiles();

			openGameFromStorage();

			//For development purpose only
			tempInitPicture(imageHandler);
		} else {
			alert('The File APIs are not fully supported in this browser.');
		}
	});

	function initLogo() {
		$(".logo_Image").load("images/FullFaceplace_logo_fullcolor.svg");
	}

	function initIconsTransitions() {
		var glassIcon = document.querySelector('#glassIcon');

		glassIcon.addEventListener('click', function () {
			if (glassButtonPosition != 'onMinus') {
				$(glassIcon).addClass('rotateRight');
				$(document.querySelector('.glassIconMinus')).addClass('changeZ');
				glassButtonPosition = 'onMinus';
			} else {
				$(glassIcon).removeClass('rotateRight');
				$(document.querySelector('.glassIconMinus')).removeClass('changeZ');
				glassButtonPosition = '';
			}
		});

		var trashIcon = document.querySelector('#trashIcon');

		trashIcon.addEventListener('click', function () {
			//As far as I've tried IE10 does not support classList property and thus jQuery used to add/remove/toggle classes
			$(trashIcon).addClass('rotateRight');
			$('.trashIconBlack').addClass('changeZ');
			setTimeout(function () {
				$(trashIcon).removeClass('rotateRight');
				$('.trashIconBlack').removeClass('changeZ');
			}, 1000);
		});
	}

	function initImageHandler() {
		var wContainer = parseInt($('#imageContent').width());
		var hContainer = parseInt($('#imageContent').height());

		if (wContainer > 0 && hContainer > 0) {
			imageHandler = new ImageHandler("kineticContainer", wContainer, hContainer);
		}
	}

	function initTopMenu() {
		//Initialize TopMenu
		NewGame.TopMenu.init(imageHandler);
		$('#menuAssets > li').click(function () {
			var divAssets = $('#' + $(this).attr('data-divAssets'));
			var activated = $('.assetsOverlay > div.displayAsset').attr('id');

			//Uncolor all top links
			$('#menuAssets > li').removeClass('selected');

			//Close every "DIV assets" opened
			$('.assetsOverlay > div.displayAsset').addClass('hideAsset').removeClass('displayAsset');

			//Open the relevant "DIV asset" and Color the top link
			if (divAssets.attr('id') !== activated) {
				$(this).addClass('selected');

				divAssets.removeClass('hideAsset').addClass('displayAsset');
			}
		});

		$('.assets > img').click(function () {
			$('.assetsOverlay > div.displayAsset').addClass('hideAsset').removeClass('displayAsset');
		});
	}

	function attachBottomButtonsEvents() {
		document.querySelector('#btnSaveAs').addEventListener('click', function () {
			if (imageHandler.isStarted) {
				var openGamePageName = "OpenGame.htm?isInSaveMode=1";

				imageHandler.toDataURL(function (strData) {
					window.sessionStorage.setItem("ImageToSave", strData);
					if ($('#pageFrame').attr('src') !== openGamePageName) {
						$('#pageFrame').attr('src', openGamePageName);

						setTimeout(function() {
							$(frames['pageFrame']).ready(
								function() {
									frames['pageFrame'].imageHandler = imageHandler;
								}
							);
						}, 500);
					}

					$(".page-container").toggleClass("save-as-page");
				});
			}
		});

		document.querySelector('#btnSave').addEventListener('click', function () {
			if (imageHandler.isStarted) {
				var openGamePageName = "OpenGame.htm?isInSaveMode=1";

				imageHandler.toDataURL(function (strData) {
					window.sessionStorage.setItem("ImageToSave", strData);
					if ($('#pageFrame').attr('src') !== openGamePageName) {
						$('#pageFrame').attr('src', openGamePageName);
						
						setTimeout(function() {
							$(frames['pageFrame']).ready(
								function() {
									frames['pageFrame'].imageHandler = imageHandler;
								}
							);
						}, 500);
					}

					$(".page-container").toggleClass("save-as-page");
				});
			}
		});

		document.querySelector('#btnClose').addEventListener('click', function () {
			if (imageHandler.isStarted && imageHandler.isChanged) {
				var layer = $('<div/>').addClass('closingLayer').text('ARE YOU SURE YOU WANT TO LEAVE WITHOUT SAVING?');

				shadowPopup.show(layer,
					    { noClose: true },
					    [
						    { text: "YES", func: function () { window.location = 'OpenGame.htm'; } },
						    { text: "NO", func: function () { shadowPopup.hide(); } }
					    ]);
			}
			else {
				window.location = 'OpenGame.htm';
			}
		});

		document.querySelector('#btnDone').addEventListener('click', function () {
			if (imageHandler.isStarted) {
				imageHandler.toDataURL(function (strData) {
					var img = document.createElement("img");
					img.onload = function () {
						shadowPopup.show(this,
							{},
							[]
						);
					};
					img.src = strData;
				});
			}
		});

		document.querySelector('#btnClearAll').addEventListener('click', function () {
			if (imageHandler.isStarted) {
				imageHandler.removeAllImages();
			}
		});

		document.querySelector('#btnUndo').addEventListener('click', function () {
			imageHandler.undo();
		});
	}

	function attachIconEvents() {
		document.querySelector('#trashIcon').addEventListener('click', function () {
			imageHandler.removeImage();
		});

		document.querySelector('#trashIcon').addEventListener('mouseenter', function () {
			$('.trashTip').show();
		});

		document.querySelector('#trashIcon').addEventListener('mouseleave', function () {
			$('.trashTip').hide();
		});

		document.querySelector('#glassIcon').addEventListener('click', function () {
			imageHandler.fitBackground();
		});
	}

	function initDropZone() {
		NewGame.BackgroundFileManager.init("btnBackgroundFile");
		face.dragAndDropManager.init("imageContent",
			function (imageData) {
				$('#chooseImageSection').hide();
				$('#kineticContainer').show();

				imageHandler.addBackground(imageData);

				$('#trashIconDisabled').addClass('trashIconBlackInvisible');
				$('.glassIconPlusOff').addClass('glassIconPlusOffInvisible');
			},
			function (files) {
				NewGame.BackgroundFileManager.addBackgroundToImageHandler(files);
			});
	}

	function initEventBrowseFiles() {
		document.querySelector('#btnBrowseFiles').addEventListener('click', function () {
			document.getElementById('btnBackgroundFile').click();
		});
	}

	function openGameFromStorage() {
		if (!!window.sessionStorage) {
			var name = window.sessionStorage.getItem("gameId");
			if (name !== undefined && name != null && name != "") {
				$('#chooseImageSection').hide();
				$('#kineticContainer').show();

				face.database.onopened(function () {
					imageHandler.getImage(name, function (data) {
						imageHandler.addBackground(data);
						window.sessionStorage.clear();
					});
				});
			}
		}
	}

	function setHelpIconEvents() {
		document.querySelector('#help_image').addEventListener('mousedown', function () {
			var src = "Images/Assets/help_disabled.png";
			$(this).attr("src", src);
		});

		document.querySelector('.img-container').addEventListener('click', function () {
			var instructionPageName = "Default.htm";

			if ($('#pageFrame').attr('src') !== instructionPageName) {
				$('#pageFrame').attr('src', instructionPageName);
			}

			$(".page-container").toggleClass("instructions-page");
		});
	}

	function tempInitPicture(im) {
		if (face.getUrlParam("isdebug") !== undefined) {
			//-----------------------------------------------------
			//------------ Init Background for debug -------------
			//-----------------------------------------------------
			$('#chooseImageSection').hide();
			$('#kineticContainer').show();

			im.addBackground("Images/Facepic.jpg");

			var asset = face.getUrlParam("Asset");
			var prop = face.getUrlParam("Prop");

			if (asset !== undefined && NewGame.TopMenu[asset] !== undefined && prop !== undefined) {
				setTimeout(function () {
					NewGame.TopMenu[asset](prop);
				}, 500);
			}
		}
	}
}());
