(function () {
	"use strict";

	var imageHandler = function (containerId, width, height) {
		var ihkinetic;
		if (ImageHandler.Kinetic) {
			//Set Kinetic initializers
			ihkinetic = new ImageHandler.Kinetic(containerId, width, height);
			ihkinetic.init();
		}

		// Source Variables
		var sources = [];
		var sourcesError = false;

		// Variable where the background will be save the filter is applied
		var imageDataNoFilter = null;

		/// <summary>
		///	Public Members
		/// </summary>
		this.preDefinedFilters = {
			grayscale: 'grayscale',
			invert: 'invert',
			luminance: 'luminance',
			brightnessContrast: 'brightnessContrast',
			brighter: 'brighter',
			darker: 'darker',
			saturation: 'saturation',
			desaturation: 'desaturation',
			//outerglow: 'outerglow',
			nofilter: 'nofilter'
		};

		this.isStarted = false;
		this.isChanged = false;

		/// <summary>
		///		Add background image to 'sources' array
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
		///		Add images to 'sources' array
		/// </summary>
		/// <param name="imageSource" type="string">
		///     Path of the image
		/// </param>
		/// <param name="name" type="string">
		///		Name assing to the image
		/// </param>
		/// <param name="options" type="JSON">
		///		Set the image options: x: position X, y: position Y, w: width, h: height
		/// </param>
		this.addImage = function (imageSource, name, options) {
			if (existBackground()) {
				//Add those properties to 'options' JSON variable
				options.name = name;
				options.isDraggable = true;
				options.isResizable = true;
				options.isBackground = false;

				addImage(imageSource, options);

				this.isChanged = true;

				return true;
			}

			return false;
		};

		/// <summary>
		///		Remove selected assets
		/// </summary>
		this.removeImage = function () {
			var deletedImageName = ihkinetic.removeImage();

			//Remove the image from the sources
			if (deletedImageName !== null) {
				for (var i = 0; i < sources.length; i++) {
					if (deletedImageName === sources[i].name) {
						sources.splice(i, 1);

						this.isChanged = true;
						
						return;
					}
				}
			}
		};

		/// <summary>
		///		Remove All selected assets
		/// </summary>
		this.removeAllImages = function () {
			this.isChanged = true;
			
			removeAllImages();			
		};

		/// <summary>
		///		Fit/Unfit background
		/// </summary>
		this.fitBackground = function () {
			this.isChanged = true;
			
			ihkinetic.fitUnfitImageByGroup("background");
		};

		/// <summary>
		///		Get the base64 canvas data
		/// </summary>
		this.toDataURL = function (callBack) {
			ihkinetic.toDataURL(callBack);
		};

		/// <summary>
		///		Save Image to IndexedDB
		/// </summary>
		this.savePic = function (imageName) {
			if (imageName !== undefined && imageName !== "") {
				ihkinetic.toDataURL(function (strData) {
					face.database.addItem(imageName, strData,
						function () {
							alert('saved');
							$('#btnSave').parent().attr('style', '');
						},
						function (evt) {
							switch (evt.target.errorCode) {
								case 4:
									alert("Image already exists");
									break;
								default:
									if (window.console !== undefined) {
										console.log(evt.target.errorCode);
									}
							}
							$('#btnSave').parent().attr('style', '');
						});
				});
			}
			else {
				alert("Insert a name");
			}
		};

		this.getImage = function (imageName, callback) {
			face.database.getItem(imageName, function (data) {
				if (callback !== undefined) {
					callback.call(this, data);
				}
			});
		};

		/// <summary>
		///		Apply filter to the background
		/// </summary>
		this.applyFilter = function (filterName) {
			if (this.preDefinedFilters[filterName] !== undefined) {
				this.isChanged = true;
				
				applyFilter.call(this, 'nofilter');
				applyFilter.call(this, filterName);
			}
		};

		/// <summary>
		///		Remove All selected assets
		/// </summary>
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

		function removeAllImages() {
			var index = sources.length - 1;

			if (!sources[index].isBackground) {
				ihkinetic.removeImage(sources[index].name, function (deletedImageName) {
					//Remove the image from the sources
					if (deletedImageName !== null) {
						sources.splice(index, 1);
					}

					removeAllImages();
				});
			}
		}

		function isImageExists(name) {
			for (var i = 0; i < sources.length; i++) {
				if (name === sources[i].name) {
					return true;
				}
			}

			return false;
		}

		function existBackground() {
			for (var i = 0; i < sources.length; i++) {
				if (sources[i].isBackground === true) {
					return true;
				}
			}

			return false;
		}

		function getProportionalWidth(objImage, h) {
			return Math.round((objImage.width / objImage.height) * h);
		}

		function getProportionalHeight(objImage, w) {
			return Math.round((objImage.height / objImage.width) * w);
		}

		function addKineticImage(image) {
			if (image.isBackground) {
				ihkinetic.addImageToBackground(image);
			}
			else {
				ihkinetic.addImage(image);
			}
		}

		function getParam(obj, param, defaultValue) {
			return (obj !== undefined && obj[param] !== undefined) ? obj[param] : ((defaultValue === undefined) ? null : defaultValue);
		}

		function applyFilter(effect) {
			var stage = ihkinetic.getStage();
			var ctx = ihkinetic.getLayer('background').getContext();
			var imageData = ctx.getImageData(0, 0, stage.width, stage.height);

			if (imageDataNoFilter === null) {
				imageDataNoFilter = imageData;
			}

			if (effect !== this.preDefinedFilters.nofilter) {
				//The time parameters will prevent caching.
				var worker = new Worker('Scripts/ImageHandler.Filters.js?time=' + new Date().toLocaleTimeString());
				worker.addEventListener('message', function (e) {
					if (e.data === null || e.data === undefined) {
						alert('No filter was applied');
						return;
					}

					ctx.putImageData(e.data, 0, 0);
				}, false);

				worker.postMessage({ imageData: imageData, effect: effect });
			}
			else {
				ctx.putImageData(imageDataNoFilter, 0, 0);
			}
		}		
	};

	window.ImageHandler = imageHandler;
} ());