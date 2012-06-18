(function() {
	"use strict";
	
	if (!face.database) {
		var database = {
			//IndexedDB system objects, support cross browsing
			indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
			IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction,
			IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange,

			//IndexedDB Settings
			dbName: "TheFacePlace",
			tables: {
				faces: { tableName: "faces", imageName: "imageName", imageData: "imageData" }
			},
			dbVersion: 1,

			//IDBDatabase object
			db: null,
			isDbInitialized: false,
			onopenedHandlers: [],

			init: function() {
				this.open();
			},

			open: function() {
				if(!face.isIndexedDbSupported) {
					alert('Your browser does not support IndexedDB API');
					return;
				}
				
				var isNewDb = false,
					request = this.indexedDB.open(this.dbName, database.dbVersion);
				
				request.onerror = database.onerror;
				request.onsuccess = function() {
					database.db = request.result;
					database.isDbInitialized = true;

					//Add Samples
					if (isNewDb) {
						database.addSampleItems();
					}

					//Call to handlers callbacks
					database.callHandlers(database.onopenedHandlers);
				};
				request.onupgradeneeded = function(e) {
					isNewDb = true;

					// Create a 'store' to store the images.
					// We're going to use "imageName" as our key path because it's guaranteed to be unique.
					var store = e.currentTarget.result.createObjectStore(database.tables.faces.tableName, { keyPath: database.tables.faces.imageName, autoIncrement: true });

					// Create an index to search customers by name
					store.createIndex(database.tables.faces.imageName, database.tables.faces.imageName, { unique: true });
				};
			},

			onopened: function(callback) {
				if (database.isDbInitialized) {
					if (callback !== undefined) {
						callback.call(this);
					}
				}
				else {
					database.onopenedHandlers.push(callback);
				}
			},

			callHandlers: function(handlers) {
				if (handlers !== undefined) {
					var handler;
					while ((handler = handlers.pop()) !== undefined) {
						handler();
					}
				}
			},

			checkDbInitialize: function() {
				if (!this.isDbInitialized) {
					return false;
				}

				return true;
			},

			remove: function() {
				var request = this.indexedDB.deleteDatabase(this.dbName);
				request.onerror = database.onerror;
				request.onblocked = function(e) {
					database.onerror("remove.request.onblocked", e);
				};
				request.onsuccess = function(e) {
					database.onerror("remove.request.onsuccess: IndexedDB Removed", e);
				};
			},

			onerror: function() {
				if (window.console !== undefined) {
					window.console.log.apply(window.console, arguments);
				}
			},

			addSampleItems: function() {
				var i;
				
				//Add Javascript Dynamically
				$('<script src="Scripts/Face.Database.SampleImages.js"></script>').appendTo('head');

				if (face.imageSamples !== undefined) {
					for (i in face.imageSamples) {
						this.addItem(i, face.imageSamples[i].data);
					}
				}
			},

			addItem: function(imageName, imageData, callbackOnSuccess, callbackOnError) {
				var transaction, objectStore, imageObject, request;
				
				if (!this.checkDbInitialize()) {
					return null;
				}

				//Open a new transaction
				transaction = this.db.transaction(this.tables.faces.tableName, this.IDBTransaction.READ_WRITE);
				transaction.onerror = database.onerror;

				//Get the object (table) to store the data in.
				objectStore = transaction.objectStore(this.tables.faces.tableName);

				//Store the image
				try {
					imageObject = { };
					imageObject[database.tables.faces.imageName] = imageName;
					imageObject[database.tables.faces.imageData] = imageData;

					request = objectStore.add(imageObject);
					request.onsuccess = function(evt) {
						if (callbackOnSuccess !== undefined && callbackOnSuccess !== null) {
							callbackOnSuccess.call(this, evt);
						}
					};
					request.onerror = function(evt) {
						database.onerror("addItem.request.onerror", evt);

						if (callbackOnError !== undefined && callbackOnError !== null) {
							callbackOnError.call(this, evt);
						}
					};
				} catch(e) {
					database.onerror("addItem.catch", e);
				}

				return this;
			},

			getItem: function(imageName, callback) {
				var trans, store, request;
				
				if (!this.checkDbInitialize()) {
					return null;
				}

				trans = this.db.transaction(this.tables.faces.tableName);
				store = trans.objectStore(this.tables.faces.tableName);

				// Get the data by 'Image Name'
				request = store.get(imageName);
				request.onerror = database.onerror;
				request.onsuccess = function(event) {
					if (callback !== undefined && event.target.result !== undefined) {
						callback.call(this, event.target.result.imageData);
					}
				};

				return this;
			},

			getItems: function(from, count, callback) {
				var current, trans, store, request, inRange;
				if (!this.checkDbInitialize()) {
					return null;
				}

				current = 0;

				//Open a new transaction
				trans = this.db.transaction(this.tables.faces.tableName);
				trans.onerror = database.onerror;

				//Get the object (table) to store the data in.
				store = trans.objectStore(this.tables.faces.tableName);

				request = store.index(database.tables.faces.imageName).openCursor();
				request.onerror = database.onerror;
				request.onsuccess = function(event) {
					var cursor = event.target.result || event.result || request.result;
					if (cursor) {
						inRange = from <= current && current < from + count;
						if (inRange) {
							if (callback !== undefined && cursor.value !== undefined) {
								callback.call(this, cursor.value.imageName, cursor.value.imageData);
							}
						}
						current += 1;
						cursor.continue();
					}
				};

				return this;
			},

			getItemCount: function(callback) {
				var trans, store, request, count;

				if (!this.checkDbInitialize()) {
					return null;
				}

				trans = this.db.transaction(this.tables.faces.tableName, this.IDBTransaction.READ_WRITE);
				store = trans.objectStore(this.tables.faces.tableName);

				request = store.count();
				request.onerror = database.onerror;
				request.onsuccess = function(event) {
					count = event.target.result;

					if (callback !== undefined && count !== undefined) {
						callback.call(this, count);
					}
				};

				return this;
			},

			deleteItem: function(key, callback) {
				var trans, store, request;
				
				if (!this.checkDbInitialize()) {
					return null;
				}

				trans = this.db.transaction(this.tables.faces.tableName, this.IDBTransaction.READ_WRITE);
				store = trans.objectStore(this.tables.faces.tableName);
				request = store.delete(key);

				request.onerror = database.onerror;
				request.onsuccess = function() {
					if (callback !== undefined) {
						callback();
					}
				};

				return this;
			},

			renameItem: function(oldName, newName, callback) {
				var trans, store, getRequest, record, setRequest;

				if (!this.checkDbInitialize()) {
					return null;
				}

				trans = this.db.transaction(database.tables.faces.tableName, this.IDBTransaction.READ_WRITE);
				store = trans.objectStore(database.tables.faces.tableName);

				// Get the data by 'Image Name'
				getRequest = store.get(oldName);
				getRequest.onerror = database.onerror;
				getRequest.onsuccess = function(event) {
					if (event.target.result !== undefined) {
						record = event.target.result;
						record.imageData = null;
						setRequest = store.put(record, oldName);
						setRequest.onerror = database.onerror;
						setRequest.onsuccess = function() {
							if (callback !== undefined && event.target.result !== undefined) {
								callback.call(this);
							}
						};
					}
				};

				return this;
			}
		};

		//Initialize the IndexedDB
		database.init();

		face.database = database;
	}
}());