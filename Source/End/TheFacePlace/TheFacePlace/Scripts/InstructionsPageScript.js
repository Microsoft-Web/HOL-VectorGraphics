(function () {
	"use strict";

	var storageKey = "ShowInstructionsView";
	var defaultPage = false;

	document.addEventListener("DOMContentLoaded", function () {
		//from default page
		if (!window.parent || window.parent == window.self) {
			var showInstructionsView = localStorage.getItem(storageKey);
			defaultPage = true;
			if (showInstructionsView == 'false') {
				goStartView(defaultPage);
			}
		} else {
			$("#bottom_nav").hide();
		}

		$(".logo_Image").load("images/FullFaceplace_logo_fullcolor.svg");

		document.getElementById("btnDontShowAgain").addEventListener("click", function () {

			if (!!window.localStorage) {
				localStorage.setItem(storageKey, false);
				goStartView(defaultPage);
			} else {
				alert('Your settings cannot be saved because your browser doesn\'t support WebStorage API\'s');
			}

		}, false);

		document.getElementById("btnStart").addEventListener("click", function () {
			goStartView(defaultPage);
		}, false);

		document.getElementById("close_image").addEventListener("mousedown", function () {
			document.getElementById("close_image").src = "Images/Assets/close_out_disabled.png";
		}, false);

		document.querySelector('.img-container').addEventListener("click", function () {
			goStartView(defaultPage);
		}, false);
	}, false);

	function goStartView(fromDefaultPage) {
		if (fromDefaultPage == true) {
			window.location = 'NewGame.htm';
		} else {
			if (window.parent !== undefined && window.parent.backToNewGame !== undefined) {
				window.parent.backToNewGame("instructions-page");
			}
		}
	}
} ());