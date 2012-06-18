#Vector Graphics (Canvas & SVG)#

## Overview ##

HTML5 provides many new APIs and features, two of which are the **Canvas** element and **SVG**, which allow us to create graphics and animations. 

SVG stands for **Scalable Vector Graphics**. It is a tag language, like HTML, for describing two-dimensional graphics.  It is a family of specifications of an XML-based file format for two-dimensional vector graphics.

Canvas though is different. It is bitmap-based, works with .bmp and .jpg images and requires some JavaScript knowledge. 

In this lab, you will learn how to use both to draw the game logo using SVG and the main functionality using Canvas.

### Objectives ###

In this hands-on lab, you will learn how to:

- Use Canvas APIs, to manipulate images
- Use SVG to draw the game logo

### Prerequisites ###

- Internet Explorer 10
- An HTML editor of your choice
- Prior knowledge of HTML and JavaScript development

## Exercises ##

This hands-on lab includes the following exercises:

1. [Exercise 1: Playing with Canvas](#Exercise1)

1. [Exercise 2: Drawing the Logo](#Exercise2)

Estimated time to complete this lab: **45-60 minutes**.

<a name="Exercise1" />
### Exercise 1: Playing with Canvas ###

In this exercise, we learn how to use and work with Canvas, manipulate and add images. To make this easier we use a third party library called [KineticJS](http://www.kineticjs.com/)

#### Task 1 - Adding Background Game and Assets to Canvas ####

In this task, we create an object called **ImageHandler.Kinetic,** working with **** the **KineticJS** library and is responsible for drawing on the Canvas.

1.	Open the solution under the **Source\Begin** folder and examine the **TheFacePlace** project.

1.	Find the **kinetic-v3.8.4.js** file under the **Source\Assets** folder**.** Add this file to the **Scripts** folder.

1.	Open **NewGame.htm**

1.	Add a link to the KineticJS JavaScript library. Pay attention to adding this JavaScript link in the right position under jquery-1.7.1.js.

	<!-- mark:3 -->
	````JavaScript
	…
	<script src="Scripts/jquery-1.7.1.js"></script>
	<script src="Scripts/kinetic-v3.8.4.js"></script>
	<script src="Scripts/FileSaver.js"></script>
	<script src="Scripts/kinetic.Extensions.js"></script>
	…
	````
	
1.	Open the **NewGame.BackgroundFileManager.js** file and locate the **init** function. Add a call to the function **addOpenFileFileEvent**, which wires the object to an event handler. 
	
	<!-- mark:4 -->
	````JavaScript
	…
	init: function(openFileButton) {
		this.openFileButton = document.getElementById(openFileButton);
		this.addOpenFileFileEvent();
	},
	…
	````

	> **Note:** Because this lab focuses on Canvas, it does not detail the whole explanation of how this event works. If you want to learn more about this, see “**New HTML5 Features**” lab.
	
1.	“Drag and drop” is managed by the **face.dragAndDropManager** object, which must be initialized by calling the **init** method before use. We need to pass a handler, which passes the image data by adding it to the Canvas. Open the file **NewGame.js** and locate the **initDropZone** function. In the anonymous function, unmark the call to **addBackground**, which is an **ImageHandler** method. 

	<!-- mark:7 -->
	````JavaScript
	…
	face.dragAndDropManager.init("imageContent",
		function(imageData) {
			$('#chooseImageSection').hide();
			$('#kineticContainer').show();
		
			imageHandler.addBackground(imageData);
		 
			$('#trashIconDisabled').addClass('trashIconBlackInvisible');
			$('.glassIconPlusOff').addClass('glassIconPlusOffInvisible');
		},
	…
	````
	
1.	We need to create the **addBackground** and **addImage** functions in the **ImageHandler** class. Open the file named **ImageHandler.js** and add the function implementations.

	<!-- mark:5-53 -->
	````JavaScript
	…
	this.isStarted = false;
	this.isChanged = false;
		 
	/// <summary>
	/// Add background image to 'sources' array
	/// </summary>
	/// <param name="imageSource" type="string">
	///     Path of the image
	/// </param>
	this.addBackground = function (imageSource) {
		var options = {
			name: "background",
			isDraggable: false,
			isResizable: false,
			isBackground: true
		};
		 
	addImage(imageSource, options, { isCentered: true, containerWidth: width, containerHeight: height });
		 
		this.isStarted = true;
		this.isChanged = true;
	};
		
	/// <summary>
	///    Add images to 'sources' array
	/// </summary>
	/// <param name="imageSource" type="string">
	///     Path of the image
	/// </param>
	/// <param name="name" type="string">
	///    Name assing to the image
	/// </param>
	/// <param name="options" type="JSON">
	///    Set the image options: x: position X, y: position Y, w: width, h: height
	/// </param>
	this.addImage = function (imageSource, name, options) {
		if (existBackground()) {
			//Add those properties to 'options' JSON variable
			options.name = name;
			options.isDraggable = false;
			options.isResizable = false;
			options.isBackground = false;
		
			addImage(imageSource, options);
		
			this.isChanged = true;

			return true;
		}
		
		return false;
	};

	…
	````

1.	The last function calls the **addImage** function, which adds important properties, such as **isDraggable**, **isResizable** and **isBackground**, to the object that is added to the Canvas. This function will create an **Image** object and, after the image is loaded, call an internal handler, which then calls another function named  **addImageOnLoad**. Add the **addImage** function as shown below.

	<!-- mark:6-32 -->
	````JavaScript
	…
	this.undo = function () {
		ihkinetic.undo();
	};
		 
	// Add images to the images array called sources
	function addImage(imageSource, imageOptions, options) {
		if (!sourcesError) {
			var onload = function () {
				if (options !== undefined) {
					if (options.isCentered) {
						imageOptions.x = (options.containerWidth - this.width) / 2;
						imageOptions.y = (options.containerHeight - this.height) / 2;
					}
				}
		 
				addImageOnLoad(this, imageOptions);
			};
		 
			var img = new Image();
			img.onerror = function () {
				sourcesError = true;
		 
				alert('Error loading some image');
			};
			img.onload = onload;
			img.src = imageSource;
			if (img.complete) {
				onload.call(img);
			}
		}
	}
	…
	````
	
1.	Add the **addImageOnLoad** function below the implementation of **addImage**. This function creates a Json object and calls the **addKineticImage** function, which adds the image to the Canvas using the **KineticJS** library.

	<!-- mark:2-35 -->
	````JavaScript
	…
	function addImage(imageSource, imageOptions, options) {
	…
	}

	function addImageOnLoad(objImage, options) {
		//Prevent to add an image that already exists
		if (!isImageExists(options.name)) {
			var image = {
				image: objImage,
				name: options.name,
				x: getParam(options, 'x'),
				y: getParam(options, 'y'),
				w: getParam(options, 'w'),
				h: getParam(options, 'h'),
				isDraggable: getParam(options, 'isDraggable', false),
				isResizable: getParam(options, 'isResizable', false),
				isBackground: getParam(options, 'isBackground', false)
			};
		 
			// Set h according to the original W.
			if (image.w !== null && image.h === null) {
				image.h = getProportionalHeight(objImage, image.w);
			}
			else if (image.w === null && image.h !== null) {
				image.w = getProportionalWidth(objImage, image.h);
			}
		 
			//Add the image to sources
			sources.push(image);
		 
			//Add image
			addKineticImage(image);
		}
	}
	…
	````

#### Task 2 - Creating the ImageHandler.Kinetic Class ####

This class handles the drawing functions using the KineticJS library and Canvas API. KineticJS manages a stage which contains layers and shapes.

>**Note:** If you wish to learn advanced usage of the KineticJS library, please refer to the following link: <http://www.kineticjs.com/>
	
1.	Open the pre-created **ImageHandler.Kinetic.js** file.

1. Create a new **Stage** using the **Stage** function from KineticJS class. Place this as the first line of the constructor of this function.

	<!-- mark:5 -->
	````JavaScript
	(function () {
		"use strict";
		ImageHandler.Kinetic = function (containerId, width, height) {
		//Set initializers
		var stage = new Kinetic.Stage(containerId, width, height);
		var layers = [];
		var selectedGroup = null;
	…
	````	

1.	This class has an initialization function called **init** that creates layers for the background and the rest of the images, and adds them to the **stage object**.

	<!-- mark:6-25 -->
	````JavaScript
	…
	this.removeImage = function (groupName, callback) {
	…
	};
		 
	/// <summary>
	///        Add Layers to the Stage (main canvas)
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
	…
	````
	
1.	Add two similar functions, **addImage** and **addImageToBackground.** These functions create a **KineticJS** group and add it to the corresponding layer.

	<!-- mark:4-27 -->
	````JavaScript
	…
	settings.halfAnchorSize = settings.anchorSize / 2;
		 
	/// <summary>
	///        Create group and add the image
	/// </summary>        
	this.addImage = function (srcImage) {
		var group = createGroupAndImage(srcImage);
		 
		layers.assets.add(group);
		layers.assets.draw();
		 
		return group;
	};
		 
	/// <summary>
	///        Create group and add the image to. 
	///        This group is added to a separated layer
	/// </summary>        
	this.addImageToBackground = function (srcImage) {
		var group = createGroupAndImage(srcImage);
		 
		layers.background.add(group);
		layers.background.draw();
		 
		return group;
	};
	…
	````
	
1.	The last step in this file is to add three important functions, **createGroupAndImage**, **createKineticGroup** and **createKineticImage**. They handle the creation of KineticJS **group** and KineticJS **image** objects.

	<!-- mark:6-40 -->
	````JavaScript
	…
	this.undo = function () {
		ImageHandler.Kinetic.Undo.go();
	};
		
	function createGroupAndImage(srcImage) {
		//Create Kinetic Group and add it to layer
		var group = createKineticGroup(srcImage);
		 
		//Create Image and add to group
		var image = createKineticImage(srcImage);
		group.add(image);
		 
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
	…
	````
	
1.	Open the **ImageHandler.js** file**,** locate the **Kinectic** initializers on the constructor of **ImageHandler** class and add a call to **ihkinetic.init**.

	<!-- mark:8 -->
	````JavaScript
	…
	(function () {
		var imageHandler = function (containerId, width, height) {
			var ihkinetic;
			if (ImageHandler.Kinetic) {
				//Set Kinetic initializers
				ihkinetic = new ImageHandler.Kinetic(containerId, width, height);
				ihkinetic.init();
			}
	…
	````
	
1.	When this stage is reached, test the game for the first time in this lab. Open the **NewGame.htm** using the http protocol. For example: <http://localhost:{port}/NewGame.htm>. You should see a picture as displayed below.

	![Sample After Picture](images/sample-after-picture.png?raw=true)

	_Sample after picture and lips assets were added_

	> **Note:** If you don’t know how to configure IIS or IIS Express, please refer to the Lab “**New HTML5 Features**”, appendix **INSTALLING IIS EXPRESS**

	> **Note:** You can see the exact picture sample using the sample below:
[http://localhost:{port}/NewGame.htm?IsDebug=1&Asset=addLips&Prop=buck_tooth.png](http://localhost:{port}/NewGame.htm?IsDebug=1&Asset=addLips&Prop=buck_tooth.png)

#### Task 3 - Moving and Resizing the Assets ####

In this task, you learn how to add moving and resizing functionality to the assets previously added.

1.	Open the **ImageHandler. js** file, locate the **addImage** method, and change the **isDraggable** and **isResizable** properties to **true**. By changing these properties, we configure the assets to be draggable and resizable.

	<!-- mark:6-7 -->
	````JavaScript
	…
	this.addImage = function (imageSource, name, options) {
		if (existBackground()) {
			//Add those properties to 'options' JSON variable
			options.name = name;
			options.isDraggable = true;
			options.isResizable = true;
			options.isBackground = false;
	…
	````
	
2.	Open the **ImageHandler.Kinetic.js** file and add handlers to manage the **Drag** and **Resize** events.

	<!-- mark:10-16 -->
	````JavaScript
	…
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
	…
	````
	
3.	Add the handlers implementation added in the previous step.

	<!-- mark:2-39 -->
	````JavaScript
	…
	function createKineticImage(source) {
	…
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
			addGroupGuides(group);
		}
	}
	…
	````	

1.	Implement the following functions to add the resize functionality. This adds four (4) squares around the assets.

	<!-- mark:6-96 -->
	````JavaScript
	…
	function addGuides(source, group) {
	…
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
	…
	````
	
1.	Add the **displayGuides** function, which moves the squares around.

	<!-- mark:6-19 -->
	````JavaScript
	…
	function updateAnchor(group, activeAnchor) {
	…
	}
		
	function displayGuides(group, isVisible) {
		var topLeft = group.getChild("topLeft");
		var topRight = group.getChild("topRight");
		var bottomRight = group.getChild("bottomRight");
		var bottomLeft = group.getChild("bottomLeft");
		 
		var displayAction = (isVisible) ? 'show' : 'hide';
		 
		//Set the guidelines
		topLeft[displayAction]();
		topRight[displayAction]();
		bottomRight[displayAction]();
		bottomLeft[displayAction]();
	}
	…
	````
	
1.	Now when running the game and positioning the mouse over the asset you should see something similar to the following picture:
	
	![Square guides](images/square-guides.png?raw=true)
 
	_Pay attention to the square guides around the lips_

#### Task 4 - Adding Guidelines ####

In this task, we add guidelines to help the player move and resize the assets.

1.	Open the **ImageHandler. js** file, if it is not already open. Locate the **addGuides** function and add a call to the **addGuidelines** function.

	<!-- mark:5 -->
	````JavaScript
	…
	function addGuides(source, group) {
		//Add UI for resize and drag actions
		if (source.isResizable) {
			addGuidelines(group);
			addGroupGuides(group);
		}
	}
	…
	````
	
1.	Add the **addGuidelines** function which displays the guidelines using the **Kinetic.Rect** function to add the rectangle around the asset, and creates a new **Kinetic.Shape** to add the cross lines.

	<!-- mark:6-50 -->
	````JavaScript
	…
	function updateAnchor(group, activeAnchor) {
	…
	}
		
	function addGuidelines(group) {
		var image = group.getChild("image");
		 
		var anchor = new Kinetic.Rect({
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
	…
	````	

1.	Now we should unhide the guidelines and crosslines. Locate the **displayGuides** function and add _all_ the lines marked in bold in the following code snippet.

	<!-- mark:3-4,14-15 -->
	````JavaScript
	…
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
	…
	````

1.	Check the game and you should see a picture similar to the one displayed below:
	
	![Guidelines Added](images/guidelines-added.png?raw=true)

	_Pay attention that guidelines were added_

#### Task 5 - Creating a Dashed Rectangle and extending the Context2D object. ####

This task shows how to extend the Context2D object by adding a new method called **dashedLine**, which we use to draw the rectangle around the asset.

1.	Open the pre-existing **kinetic.Extensions.js** file.

1.	The first step is to extend the Context2D using its prototype. This extension enables drawing a simple dashed line that is used to create a rectangle around the asset.

	<!-- mark:1-75 -->
	````JavaScript
	/// Add DashedLine to 'Canvas 2D' object
	if (window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype.lineTo)
	{
		CanvasRenderingContext2D.prototype.dashedLine = function (x, y, x2, y2, dashArray, start)
		{
			if (!dashArray)
			{
				dashArray = [10, 5];
			}
			var dashCount = dashArray.length;
			var dashSize = 0;
			for (var i = 0; i < dashCount; i++)
			{
				dashSize += parseInt(dashArray[i]);
			}
			var dx = (x2 - x);
			var dy = (y2 - y);
			var slopex = (dy < dx);
			var slope = (slopex) ? dy / dx : dx / dy;
			var dashOffSet = dashSize * (1 - (start / 100));
			if (slopex)
			{
				var xOffsetStep = Math.sqrt(dashOffSet * dashOffSet / (1 + slope * slope));
				x -= xOffsetStep;
				dx += xOffsetStep;
				y -= slope * xOffsetStep;
				dy += slope * xOffsetStep;
			} else
			{
				var yOffsetStep = Math.sqrt(dashOffSet * dashOffSet / (1 + slope * slope));
				y -= yOffsetStep;
				dy += yOffsetStep;
				x -= slope * yOffsetStep;
				dx += slope * yOffsetStep;
			}
		 
			this.moveTo(x, y);
			var distRemaining = Math.sqrt(dx * dx + dy * dy);
			var dashIndex = 0;
			var draw = true;
		 
			while (distRemaining >= 0.1 && dashIndex < 10000)
			{
				var dashLength = dashArray[dashIndex++ % dashCount];
				if (dashLength > distRemaining)
				{
					dashLength = distRemaining;
				}
				if (slopex)
				{
					var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
					x += xStep;
					y += slope * xStep;
				} else
				{
					var yStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
					y += yStep;
					x += slope * yStep;
				}
				if (dashOffSet > 0)
				{
					dashOffSet -= dashLength;
					this.moveTo(x, y);
				} else
				{
					this[draw ? 'lineTo' : 'moveTo'](x, y);
				}
				distRemaining -= dashLength;
				draw = !draw;
			}
		 
			// Ensure that the last segment is closed for proper stroking
			this.moveTo(0, 0);
		};
	}
	```` 

1.	Now extend the KineticJS class, adding the **DashedRect** method.

	<!-- mark:1-21 -->
	````JavaScript
	…
	Kinetic.DashedRect = function (config)
	{
			var dashGapArray = [8, 5];
		 
			config.drawFunc = function ()
			{
				var context = this.getContext();
		 
				context.beginPath();
				context.dashedLine(0, 0, this.width, 0, dashGapArray, 0);
				context.dashedLine(0, this.height, this.width, this.height, dashGapArray, 0);
				context.dashedLine(0, 0, 0, this.height, dashGapArray, 0);
				context.dashedLine(this.width, 0, this.width, this.height, dashGapArray, 0);
				context.closePath();
				this.fillStroke();
			};
		 
			// call super constructor
			Kinetic.Shape.apply(this, [config]);
	};
	````

1.	Add methods to configure the new **DashedRect** object.

	<!-- mark:7-30 -->
	````JavaScript
	…
	Kinetic.DashedRect = function (config)
	{
	…
	}
		
	/* DashedRect methods */
	Kinetic.DashedRect.prototype = {
		setWidth: function (width)
		{
			this.width = width;
		},
		getWidth: function ()
		{
			return this.width;
		},
		setHeight: function (height)
		{
			this.height = height;
		},
		getHeight: function ()
		{
			return this.height;
		},
		setSize: function (width, height)
		{
			this.width = width;
			this.height = height;
		}
	};
	````

1.	Finally, add this object to the **GlobalObject** using the **extend** method that KineticJS exposes as an API.

	<!-- mark:6-7 -->
	````JavaScript
	…
	Kinetic.DashedRect.prototype = {
	…
	}
		
	// extend Geometry
	Kinetic.GlobalObject.extend(Kinetic.DashedRect, Kinetic.Shape);
	````
	

1.	Open the **ImageHandler.Kinetic.js** file, locate the **addGuidelines** function, and use the new **DashedRect** method instead of **Rect**.

	<!-- mark:5 -->
	````JavaScript
	…
	function addGuidelines(group) {
		var image = group.getChild("image");
	 
		var anchor = new Kinetic.DashedRect({
			…
		});
	…
	````

1.	Check the game and you should see a picture like the one displayed below:
	 
	![Dashed Rectangle](images/dashed-rectangle.png?raw=true)

	_A dashed rectangle is displayed around the asset_

This concludes the part one of the lab.

<a name="Exercise2" />
### Exercise 2: Drawing the Logo ###

The starting point for this exercise is the solution located in the lab installation folder under the **Source\Begin** folder, with which we worked in the previous exercise. The solution contains a fully functional project, but the logo is incomplete. As you progress through the exercise, you will learn how to add and use SVG filters, which are supported by Internet Explorer 10.

#### Task 1 - Adding the Face Place to the Logo ####

In this first task, you will understand how the “The Face Place” logo was created.

1.	Open the **FullFaceplace_logo_fullcolor.svg** file located under the **Images** folder.

1. Find the marked lines for “FACE” and add the polygons and path to create the word “Face”.

	<!-- mark:6-16 -->
	````XML
	…
	<!-- ********** -->
	<!-- ** FACE ** -->
	<!-- ********** -->
		 
	<!-- FACE - "F" -->
	<polygon  fill="#CAECFF" stroke="#03A3FF" stroke-miterlimit="10" points="153.5,61.5 125.875,62.75 126.75,105.375 138.625,105.375 135.375,89 146,88.75 145.75,82 135,80.75 134.75,69.375 153.5,69.5" id="BlueF" />
		 
	<!-- FACE - "A" -->
	<path fill="#CAECFF" stroke="#03A3FF" stroke-miterlimit="10" d="M172.25,62.25h-13.125l-9.875,43.125l9.875-2.375 l3.125-13.875L165.125,89l5.125,16.375H176L172.25,62.25z M163.333,79.333l1.5-8.333l1.5,8.333H163.333z" id="BlueA" />
		 
	<!-- FACE - "C" -->
	<polygon fill="#CAECFF" stroke="#03A3FF" stroke-miterlimit="10" points="203.625,62.25 205,73 194.5,70.375 191.375,77.625 194.75,94.625 207,94.625 207,104.875 191.375,104.875 183.25,100.375 181.125,70.375 185.625,62.25" id="BlueC" />
		 
	<!-- FACE - "E" -->
	<polygon fill="#CAECFF" stroke="#03A3FF" stroke-miterlimit="10" points="214.375,61.5 239.625,62.25 239.625,70.125 221.75,68.25 221,80 235.625,80.625 235.425,87.751 233.857,89.5 220.25,89.5 220.375,94.875 238.5,96.5 238.375,104.875 215,104.875 212.875,103.75" id="BlueE" />
	…
	````

1.	If you check at this stage, you should see “Face” as part of the logo.

1.	Find the “PLACE” mark and add the following code to create the word “Place”. Note that we also add a **linear gradient**, which is used to fill this word.
	
	<!-- mark:5-23 -->
	````XML
	…
	<!-- *********** -->
	<!-- ** PLACE ** -->
	<!-- *********** -->
	<linearGradient id="gradiantPlace" gradientUnits="userSpaceOnUse" x1="268.9375" y1="73" x2="268.9375" y2="93.0444">
		<stop offset="0" style="stop-color:#F2F4D3" id="stop4998" />
		<stop offset="1" style="stop-color:#DAE02F" id="stop5000" />
	</linearGradient>
		 
	<!-- PLACE - "P" -->
	<path fill="url(#gradiantPlace)" stroke="#DAE07E" stroke-miterlimit="10" d="M277.625,66.5h-20.75l-0.625,37.25h8.625L264,87.25h11.875 l5.75-5.375V72.75L277.625,66.5z M273.063,78.313l-0.625,1.021h-6.063l-0.75-0.771v-3.396l1.188-0.854h5l1.25,2.125V78.313z" id="YellowP" />
		 
	<!-- PLACE - "L" -->
	<polygon fill="url(#gradiantPlace)" stroke="#DAE07E" stroke-miterlimit="10" points="288.25,65.5 297.5,65.5 294.125,97.5 302.875,95.25 303.625,103.75 284.875,103.75" id="YellowL" />
		 
	<!-- PLACE - "A" -->
	<path fill="url(#gradiantPlace)" stroke="#DAE07E" stroke-miterlimit="10" d="M326.747,66.5h-13.125l-9.186,38.875l9.875-2.375 l3.125-13.875L320.312,89l3.355,15.875l7.52,0.5L326.747,66.5z M318.52,80.99l1.5-6.74l1.5,6.74H318.52z" id="YellowA" />
		 
	<!-- PLACE - "C" -->
	<polygon fill="url(#gradiantPlace)" stroke="#DAE07E" stroke-miterlimit="10" points="350.667,65.5 353.167,75.167 343,73.667 340.167,78.5 343,95.333 353.833,95.333 353.833,103.75 340.167,103.75 333.167,99.667 331.187,74.167 334.833,66.5" id="YellowC" />
		 
	<!-- PLACE - "E" -->
	<polygon fill="url(#gradiantPlace)" stroke="#DAE07E" stroke-miterlimit="10" points="382.167,65.5 384.167,66.5 384.167,72.5 368.167,71 367.167,81.667 380,81.667 379.833,90.833 366.5,90.833 366.5,94 383.167,96.333 382.833,103.75 359.667,103.75 360.833,65.5" id="YellowE" />
	…
	````
	
1.	Check the newly created logo. We recommend zooming-in to view logo details.
	 
	![Face Place Logo solid color](images/face-place-logo-solid-color.png?raw=true)

	_Logo - Pay attention: The word “Face” is currently a solid color._

#### Task 2 - Adding Filters to “Face” ####

During this task, you will learn how to add and use filters to generate different logo effects.

1.	Locate the **defs** node at the top of the **FullFaceplace_logo_fullcolor.svg** file. Here we define the filter to apply later.

	<!-- mark:6-10 -->
	````XML
	…
	<metadata id="metadata5030">
	…
	</metadata>
	<defs>
		<filter id="lighting_filter">
			<feSpecularLighting result="result1" lighting-color = "yellow">                                        <feSpotLight x="0" y="40" z="50" pointsAtX="30%" pointsAtY="30%" pointsAtZ="-10%" limitingConeAngle="50" specularExponent="2" />
			</feSpecularLighting>
			<feComposite operator="arithmetic" k1="1" k2="1" k3="0" k4="0" in="SourceGraphic" in2="result1" />
		</filter>
	</defs>
	…
	````
	
1.	Find the polygons and the path that form the word “Face”. Add a new attribute called “filter” and set the filter you wish to use, in our case we use the new filter we just created.

	<!-- mark:7,10,13,16 -->
	````XML
	…
	<!-- ********** -->
	<!-- ** FACE ** -->
	<!-- ********** -->
		
	<!-- FACE - "F" -->
	<polygon filter="url(#lighting_filter)" fill="#CAECFF" … id="BlueF"/>
		 
	<!-- FACE - "A" -->
	<path filter="url(#lighting_filter)" fill="#CAECFF" … id="BlueA" />
		 
	<!-- FACE - "C" -->
	<polygon filter="url(#lighting_filter)" fill="#CAECFF" … id="BlueC" />
		 
	<!-- FACE - "E" -->
	<polygon filter="url(#lighting_filter)" fill="#CAECFF" … id="BlueE" />
	…
	````
	
1.	Now the logo should be displayed as shown below
	
	![Face Place Logo lit from the top](images/face-place-logo-lit-from-the-top.png?raw=true)
 
	_Logo - Pay attention: The word “Face” is now lit from the top._

## Summary ##

This lab shows how to work with and use images on the Canvas using the KineticJS library. We also extended the Context2D object by creating an object that can draw dashed lines, and showed how to work with SVG and apply filters to our shapes.