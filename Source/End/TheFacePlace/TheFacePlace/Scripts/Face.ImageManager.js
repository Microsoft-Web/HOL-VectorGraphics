(function() {
	"use strict";

	if (!face.imageManager) {
		var imageManager = function (database) {
			this.that = this;

			this._database = database;

			this.insertImage = function(name, imageSource, callback) {
				var image = new Image();
				var that = this;
				image.onload = function() {
					var canvas = document.createElement("canvas");
					canvas.width = image.width;
					canvas.height = image.height;

					var context = canvas.getContext("2d");
					context.drawImage(image, 0, 0);

					var url = canvas.toDataURL();
					that._database.addItem(name, url, function() {
						if (callback !== undefined) {
							callback(true);
						}
					}, function() {
						if (callback !== undefined) {
							callback(false);
						}
					});
				};

				image.src = imageSource;
				if (imageSource === null || imageSource === undefined) {
					that._database.addItem(name, null, function() {
						if (callback !== undefined) {
							callback(true);
						}
					}, function() {
						if (callback !== undefined) {
							callback(false);
						}
					});
				}
			};

			this.deleteImage = function(name, callback) {
				this._database.deleteItem(name, function() {
					if (callback !== undefined) {
						callback();
					}
				});
			};

			this.retrieveImage = function(name, callback) {
				this._database.getItem(name, function(imageData) {
					var image = new Image();
					image.src = imageData;
					if (callback !== undefined) {
						callback(image);
					}
				});
			};

			this.renameImage = function(oldName, newName, callback) {
				var db = this._database;
				if (oldName !== newName) {
					db.getItem(oldName, function(imageData) {
						db.addItem(newName, imageData, function() {
							db.deleteItem(oldName, function() {
								if (callback !== undefined) {
									callback();
								}
							});
						}, function() {
							return false;
						});
					});
				}
			};

			this.getImageCount = function(callback) {
				return this._database.getItemCount(function(count) {
					callback(count);
				});
			};

			this.retrieveImages = function(from, count, callback) {
				this._database.getItems(from, count, function(imageName, imageData) {
					var image = new Image();
					image.src = imageData;

					if (callback !== undefined) {
						callback(imageName, image);
					}
				});
			};

			this.createImageAndExecuteCallback = function(imageData, callback) {
				var image = new Image();
				image.src = imageData;
				if (callback !== undefined) {
					callback(image);
				}
			};
		};

		face.imageManager = new imageManager(face.database);
	}
}());