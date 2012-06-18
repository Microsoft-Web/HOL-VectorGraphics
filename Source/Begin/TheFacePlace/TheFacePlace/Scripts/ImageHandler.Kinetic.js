(function () {
	"use strict";
	ImageHandler.Kinetic = function (containerId, width, height) {
		//Set initializers
		var layers = [];
		var selectedGroup = null;
		var isDraggingAnchor = false;
		var fittedImageProperties = null;

		//Settings global variable
		var settings = {
			anchorSize: 12
		};
		settings.halfAnchorSize = settings.anchorSize / 2;


		/// <summary>
		///		Create group and add the image
		/// </summary>		
		this.removeImage = function (groupName, callback) {
			if (groupName !== undefined) {
				selectedGroup = layers.assets.getChild(groupName);
			}

			if (selectedGroup !== null) {
				var tmpselectedGroup = selectedGroup;
				var imageName = selectedGroup.name;

				var period = 20000; // in ms
				var amplitudeX = selectedGroup.x / 20;
				var amplitudeY = (stage.height - selectedGroup.y) / 30;

				stage.onFrame(function (frame) {
					tmpselectedGroup.x = tmpselectedGroup.x - amplitudeX * Math.sin(frame.time * 2 * Math.PI / period);
					tmpselectedGroup.y = tmpselectedGroup.y + amplitudeY * Math.sin(frame.time * 2 * Math.PI / period);

					layers.assets.draw();

					if (tmpselectedGroup.x < 0 && tmpselectedGroup.y > stage.height) {
						stage.stop();

						layers.assets.remove(tmpselectedGroup);
						layers.assets.draw();

						if (callback !== undefined) {
							callback.call(this, imageName);
						}
					}
				});

				stage.start();

				selectedGroup = null;

				return imageName;
			}

			return null;
		};

		/// <summary>
		///		Get the stage
		/// </summary>		
		this.getStage = function () {
			return stage;
		};

		/// <summary>
		///		Get specific layer 
		/// </summary>		
		this.getLayer = function (layer) {
			if (layer !== undefined && layers[layer] !== undefined) {
				return layers[layer];
			}

			return null;
		};

		this.toDataURL = function (callback) {
			stage.toDataURL(callback);
		};

		/// <summary>
		///		Get specific layer 
		/// </summary>		
		this.fitUnfitImageByGroup = function (groupName) {
			var w, h, x = 0, y = 0;
			var bgGroup = layers.background.getChild(groupName);
			var bgImage = bgGroup.getChild("image");

			if (fittedImageProperties === null) {
				//Store the original properties of the image and group
				fittedImageProperties = {};
				fittedImageProperties.x = bgGroup.x;
				fittedImageProperties.y = bgGroup.y;
				fittedImageProperties.width = bgImage.width;
				fittedImageProperties.height = bgImage.height;

				//Calculate Relations
				var stageSizeRelation1 = stage.width / stage.height;
				var stageSizeRelation2 = stage.height / stage.width;

				var imageSizeRelation1 = bgImage.width / bgImage.height;
				var imageSizeRelation2 = bgImage.height / bgImage.width;

				//Decide how to resize the image and where to relocate the group
				if (stageSizeRelation1 > stageSizeRelation2 && imageSizeRelation1 > imageSizeRelation2) {
					w = stage.width;
					h = stage.width * imageSizeRelation2;

					y = (stage.height - h) / 2;
				}
				else {
					w = stage.height * imageSizeRelation1;
					h = stage.height;

					x = (stage.width - w) / 2;
				}
			}
			else {
				//Returns the group to the original location
				x = fittedImageProperties.x;
				y = fittedImageProperties.y;

				//Retuns the image to the original size
				w = fittedImageProperties.width;
				h = fittedImageProperties.height;

				//Reset the storage
				fittedImageProperties = null;
			}

			bgGroup.x = x;
			bgGroup.y = y;
			bgImage.width = w;
			bgImage.height = h;

			layers.background.draw();
		};

		/// <summary>
		///		Undo Action
		/// </summary>		
		this.undo = function () {
			ImageHandler.Kinetic.Undo.go();
		};

	};
} ());