(function () {
	"use strict";

	var layers, undoStorage, propertiesToStore;
	undoStorage = {};
	propertiesToStore = {
		"x": "getPosition().x",
		"y": "getPosition().y",
		"width": "getChild('image').width",
		"height": "getChild('image').height"
	};

	ImageHandler.Kinetic.Undo = {
		init: function (kineticLayers) {
			layers = kineticLayers;
		},

		go: function () {
			//Retrieve properties from storage Object
			retrieveFromStorage();

			//Reset the storage Object
			undoStorage = {};

			//Re-draw the canvas
			layers.assets.draw();
		},

		storeObject: function (obj) {
			var jsonObj = {};
			for (var prop in propertiesToStore) {
				jsonObj[prop] = getPropertyValue(obj, propertiesToStore[prop]);
				;
			}

			undoStorage[obj.name] = jsonObj;
		}
	};

	function retrieveFromStorage() {
		for (var groupName in undoStorage) {
			var group = layers.assets.getChild(groupName);

			for (var prop in undoStorage[groupName]) {
				if (group[prop] !== undefined) {
					group[prop] = undoStorage[groupName][prop];
				}
				else {
					setPropertyValue(group, propertiesToStore[prop], undoStorage[groupName][prop]);
				}
			}
		}
	}

	function getProperty(obj, props) {
		var properties, i, p, funcParams;
		properties = props.split('.');

		var tmpValue = obj;

		for (i = 0; i < properties.length; i++) {
			p = properties[i].replace(/\(.*/, '');

			if (p !== null && tmpValue[p] !== undefined) {

				if (typeof tmpValue[p] === 'function') {
					funcParams = getArrayParams(properties[i]);

					tmpValue = obj[p].apply(obj, funcParams);
				}
				else {
					return { "object": tmpValue, "property": p };
				}
			}
		}

		return null;
	}

	function getPropertyValue(obj, props) {
		var tmpValue = getProperty(obj, props);

		if (tmpValue !== null) {
			tmpValue = tmpValue.object[tmpValue.property];
		}

		return (typeof tmpValue === 'number' || typeof tmpValue === 'string') ? tmpValue : undefined;
	}

	function setPropertyValue(obj, props, value) {
		var tmpValue = getProperty(obj, props);

		if (tmpValue !== null) {
			tmpValue.object[tmpValue.property] = value;
		}

		return tmpValue.object[tmpValue.property];
	}

	function getArrayParams(params) {
		var p = params.replace(/.*\(|\)/gi, '');

		if (p.length > 0) {
			p = p.split(/\s*,\s*/);

			for (var i = 0; i < p.length; i++) {
				if (typeof p[i] === 'string') {
					p[i] = p[i].trim();
				}
			}
		}
		else {
			p = [];
		}

		return p;
	}

	String.prototype.trim = function () {
		return this.replace(/[^\w\s]/gi, '');
	};
} ());