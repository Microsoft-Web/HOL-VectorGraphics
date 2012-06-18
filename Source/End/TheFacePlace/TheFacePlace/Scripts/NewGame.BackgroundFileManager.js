(function () {
	"use strict";
	var backgroundFileManager = {
		openFileButton: null,

		init: function (openFileButton) {
			this.openFileButton = document.getElementById(openFileButton);
			this.addOpenFileFileEvent();
		},

		addOpenFileFileEvent: function () {
			if (this.openFileButton !== null) {
				this.openFileButton.addEventListener('change', this.handleFileSelect, false);
			}
		},

		handleFileSelect: function (evt) {
			var files = evt.target.files;
			backgroundFileManager.addBackgroundToImageHandler(files);
		},

		addBackgroundToImageHandler: function (files) {
			if (files.length === 1 && files[0].type !== undefined && files[0].type.match('image.*')) {
				
				var f = files[0],
					reader = new FileReader();
				reader.onload = function (e) {
					face.dragAndDropManager.addDragAndDropEvents(true);

					face.dragAndDropManager.callBackOnLoadImage.call(window, e.target.result);
				};

				// Read in the image file as a data URL.
				reader.readAsDataURL(f);

			} else {
				alert('No file supported');
			}
		}
	};

	window.NewGame.BackgroundFileManager = backgroundFileManager;
} ());