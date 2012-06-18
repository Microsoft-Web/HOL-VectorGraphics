(function () {
	"use strict";
	ImageHandler.Kinetic = function (containerId, width, height) {
		//Set initializers
		var stage = new Kinetic.Stage(containerId, width, height);
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
		this.addImage = function (srcImage) {
			var group = createGroupAndImage(srcImage);

			layers.assets.add(group);
			layers.assets.draw();

			return group;
		};

		/// <summary>
		///		Create group and add the image to. 
		///		This group is added to a separated layer
		/// </summary>		
		this.addImageToBackground = function (srcImage) {
			var group = createGroupAndImage(srcImage);

			layers.background.add(group);
			layers.background.draw();

			return group;
		};

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
		///		Add Layers to the Stage (main canvas)
		/// </summary>		
		this.init = function () {
			//Create Layers
			layers.assets = new Kinetic.Layer();
			layers.background = new Kinetic.Layer();

			//Add Layers to stage/canvas
			for (var layer in layers) {
				stage.add(layers[layer]);
			}

			//Set Background Layer
			layers.background.listen(false);
			layers.background.moveToBottom();

			//Set Init Undo
			ImageHandler.Kinetic.Undo.init(layers);
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

		function createGroupAndImage(srcImage) {
			//Create Kinetic Group and add it to layer
			var group = createKineticGroup(srcImage);

			//Create Image and add to group
			var image = createKineticImage(srcImage);
			group.add(image);

			if (srcImage.isResizable || srcImage.isDraggable) {
				//Add Events to the Group
				addGroupEvents(group);

				//Add Anchors and GuideLines
				addGuides(srcImage, group);
			}

			return group;
		};

		function createKineticGroup(source) {
			//Create a new Kinetic Group
			var group = new Kinetic.Group({
				x: source.x !== null ? source.x : 0,
				y: source.y !== null ? source.y : 0,
				draggable: source.isDraggable,
				name: source.name
			});

			return group;
		}

		function createKineticImage(source) {
			var image = new Kinetic.Image({
				image: source.image,
				name: "image",
				x: !source.isResizable ? 0 : settings.halfAnchorSize,
				y: !source.isResizable ? 0 : settings.halfAnchorSize,
				width: source.w != null ? source.w : source.image.width,
				height: source.h != null ? source.h : source.image.height
			});

			return image;
		}

		function addGroupEvents(group) {
			group.on("click", function () {
				selectedGroup = selectedGroup === null ? this : null;

				displayGuides(group, selectedGroup !== null);

				layers.assets.draw();
			});

			group.on("mousedown", function () {
				this.moveToTop();

				ImageHandler.Kinetic.Undo.storeObject(this);
			});

			group.on("mouseover", function () {
				displayGuides(group, true);
				layers.assets.draw();
			});

			group.on("mouseout", function () {
				if (!isDraggingAnchor && selectedGroup !== this) {
					displayGuides(group, false);
					layers.assets.draw();
				}
			});
		}

		function addGuides(source, group) {
			//Add UI for resize and drag actions
			if (source.isResizable) {
				addGuidelines(group);
				addGroupGuides(group);
			}
		}

		function addGroupGuides(group) {
			var image = group.getChild("image");

			addAnchor(group, 0, 0, "topLeft");
			addAnchor(group, image.width, 0, "topRight");
			addAnchor(group, image.width, image.height, "bottomRight");
			addAnchor(group, 0, image.height, "bottomLeft");
		}

		function addAnchor(group, x, y, name) {
			var anchor = new Kinetic.Rect({
				x: x,
				y: y,
				width: settings.anchorSize,
				height: settings.anchorSize,
				stroke: "#666",
				fill: "#fff",
				strokeWidth: 1,
				name: name,
				draggable: true
			});

			//Add Events to the anchor
			anchor.on("dragmove", function () {
				updateAnchor(group, this);
			});

			anchor.on("mousedown", function () {
				isDraggingAnchor = true;
				group.draggable(false);
				this.moveToTop();
			});

			anchor.on("mouseup", function () {
				isDraggingAnchor = false;
			});

			anchor.on("dragend", function () {
				isDraggingAnchor = false;
				group.draggable(true);
			});

			//Hide this anchor
			anchor.hide();

			//Add anchor to group
			group.add(anchor);
		}

		function updateAnchor(group, activeAnchor) {
			var topLeft = group.getChild("topLeft");
			var topRight = group.getChild("topRight");
			var bottomRight = group.getChild("bottomRight");
			var bottomLeft = group.getChild("bottomLeft");
			var image = group.getChild("image");
			var guidelines = group.getChild("Guidelines");
			var crossLines = group.getChild("CrossLines");

			// update anchor positions
			switch (activeAnchor.name) {
				case "topLeft":
					topRight.y = activeAnchor.y;
					bottomLeft.x = activeAnchor.x;
					break;
				case "topRight":
					topLeft.y = activeAnchor.y;
					bottomRight.x = activeAnchor.x;
					break;
				case "bottomRight":
					bottomLeft.y = activeAnchor.y;
					topRight.x = activeAnchor.x;
					break;
				case "bottomLeft":
					bottomRight.y = activeAnchor.y;
					topLeft.x = activeAnchor.x;
					break;
			}

			image.x = topLeft.x + settings.halfAnchorSize;
			image.y = topLeft.y + settings.halfAnchorSize;
			image.width = topRight.x - topLeft.x;
			image.height = bottomLeft.y - topLeft.y;

			guidelines.x = image.x;
			guidelines.y = image.y;
			guidelines.width = image.width;
			guidelines.height = image.height;

			crossLines.x = image.x - settings.halfAnchorSize;
			crossLines.y = image.y - settings.halfAnchorSize;
		}

		function addGuidelines(group) {
			var image = group.getChild("image");

			var anchor = new Kinetic.DashedRect({
				x: settings.halfAnchorSize,
				y: settings.halfAnchorSize,
				width: image.width,
				height: image.height,
				stroke: "#fff",
				strokeWidth: 1,
				name: "Guidelines",
				draggable: true
			});

			var crossLines = new Kinetic.Shape({
				drawFunc: function () {
					var context = this.getContext();

					context.beginPath();

					var x = image.width / 2 + settings.halfAnchorSize;
					context.moveTo(x, settings.halfAnchorSize);
					context.lineTo(x, image.height + settings.halfAnchorSize);

					var y = image.height / 2 + settings.halfAnchorSize;
					context.moveTo(settings.halfAnchorSize, y);
					context.lineTo(image.width + settings.halfAnchorSize, y);

					context.closePath();

					this.fillStroke();
				},
				stroke: "#fff",
				strokeWidth: 1,
				name: "CrossLines"
			});

			//Hide the guidelines 
			anchor.hide();
			crossLines.hide();

			//Add to the group
			group.add(anchor);
			group.add(crossLines);
		}

		function displayGuides(group, isVisible) {
			var guidelines = group.getChild("Guidelines");
			var crossLines = group.getChild("CrossLines");

			var topLeft = group.getChild("topLeft");
			var topRight = group.getChild("topRight");
			var bottomRight = group.getChild("bottomRight");
			var bottomLeft = group.getChild("bottomLeft");

			var displayAction = (isVisible) ? 'show' : 'hide';

			//Set the guidelines
			guidelines[displayAction]();
			crossLines[displayAction]();
			topLeft[displayAction]();
			topRight[displayAction]();
			bottomRight[displayAction]();
			bottomLeft[displayAction]();
		}
	};
} ());