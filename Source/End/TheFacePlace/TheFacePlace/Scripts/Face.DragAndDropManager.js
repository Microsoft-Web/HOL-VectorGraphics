(function () {
	"use strict";

	var dragAndDropManager = {
		dropCallback: null,
		dropTarget: null,
		callBackOnLoadImage: null,

		init: function (dropTargetId, callBackOnLoadImage, dropCallback) {
			this.dropCallback = dropCallback;
			if (callBackOnLoadImage !== undefined) {
				//init members
				this.dropTarget = document.getElementById(dropTargetId);
				this.callBackOnLoadImage = callBackOnLoadImage;

				this.addDragAndDropEvents();
			}
		},

		addDragAndDropEvents: function (isRemoveEvents) {
			if (this.dropTarget !== null) {
				if (isRemoveEvents === undefined || isRemoveEvents !== true) {
					// Setup the dnd listeners.
					this.dropTarget.addEventListener('dragover', this.doOnDragover, false);
					this.dropTarget.addEventListener('drop', this.doOnDrop, false);
				}
				else {
					this.removeDragAndDropEvents();

					this.dropTarget.addEventListener('dragover', function (evt) {
						evt.stopPropagation();
						evt.preventDefault();

						// Explicitly show this is a copy.
						evt.dataTransfer.dropEffect = 'none';
					}, false);
				}
			}
		},

		removeDragAndDropEvents: function () {
			if (this.dropTarget !== null) {
				// Remove the listeners.
				this.dropTarget.removeEventListener('dragover', this.doOnDragover, false);
				this.dropTarget.removeEventListener('drop', this.doOnDrop, false);
			}
		},

		doOnDragover: function (evt) {
			evt.stopPropagation();
			evt.preventDefault();

			// Explicitly show this is a copy.
			evt.dataTransfer.dropEffect = 'copy';
		},

		doOnDrop: function (evt) {
			evt.stopPropagation();
			evt.preventDefault();

			if (dragAndDropManager.dropCallback != undefined) {
				dragAndDropManager.dropCallback(evt.dataTransfer.files);
			}
		}
	};

	face.dragAndDropManager = dragAndDropManager;
} ());
