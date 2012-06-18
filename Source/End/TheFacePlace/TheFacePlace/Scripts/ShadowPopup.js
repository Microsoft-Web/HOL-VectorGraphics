(function () {
	"use strict";
	var shadowObject, options;

	var shadowPopup = {
		show: function (objectToAppend, jsonOptions, jsonButtons) {
			shadowObject = shadowPopup.createShadowPopUp(objectToAppend);
			options = jsonOptions;

			shadowPopup.addCloseButton();

			shadowPopup.addContent(objectToAppend);

			shadowPopup.addButtons(jsonButtons);
		},
		hide: function () {
			shadowPopup.toggleHelpIcon();

			$('#ShadowPopUp').remove();
		},
		createShadowPopUp: function () {
			//Remove existent ShadowPopup (in case it already exists)
			shadowPopup.hide();

			//Append ShadowPopup main container
			$("#pageContainer").after("<DIV id=ShadowPopUp class=shadowPopUp></DIV>");

			return $('#ShadowPopUp');
		},
		addCloseButton: function () {
			if (options !== undefined && options.noClose !== true) {
				$('#ShadowPopUp').append("<div class=close><IMG src='images/assets/closeout_white.png'/></div>");
				$('#ShadowPopUp > .close').click(function () {
					shadowPopup.hide();
				});
			}
		},
		addContent: function (objectToAppend) {
			shadowObject.append(objectToAppend);
		},
		addButtons: function (jsonButtons) {
			if (jsonButtons !== undefined) {
				var buttonsDiv = $('<div/>').addClass('closingButtons');

				for (var i = 0; i < jsonButtons.length; i++) {
					if (jsonButtons[i].text !== undefined && jsonButtons[i].func !== undefined) {
						buttonsDiv.append(shadowPopup.createButton(jsonButtons[i].text, jsonButtons[i].func));
					}
				}

				shadowObject.append(buttonsDiv);
			}
		},
		createButton: function (buttonText, clickFunc) {
			var button = $('<button/>').addClass('button').text(buttonText).click(clickFunc);

			return button;
		},
		toggleHelpIcon: function () {
			$('#helpIcon').toggle();
		}
	};

	window.shadowPopup = { show: shadowPopup.show, hide: shadowPopup.hide };
} ());