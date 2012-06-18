(function () {
	"use strict";

	//Check for IndexedDB support
	var isIndexedDbSupported = !!(window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB);

	if (window.face === undefined) {
		window.face = {
			isIndexedDbSupported: isIndexedDbSupported,
			
			isSupportedBrowser: window.File && window.FileReader && window.FileList && window.Blob && isIndexedDbSupported,

			getUrlParam: function (param) {
				var vars = {};

				window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
					vars[key.toLowerCase()] = value;
				});

				return vars[param.toLowerCase()];
			}
		};
	}
} ());


window.backToNewGame = function (className) {
	"use strict";

	$(".page-container").toggleClass(className);

	$('#pageFrame').attr('src', 'about:blank');
};