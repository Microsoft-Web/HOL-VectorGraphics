(function () {
	"use strict";
	var imageHandler = null;
	var isAppliedFilter = false;
	var assetsJson = {
		Eyes: {
			ImagesPath: 'Images/FaceAssets/Eyes/',
			DataFunction: 'addEyes',
			CssClass: 'eyes',
			Icons: [
				{ src: 'blue_pair.png', dataParams: 'blue_left.png, blue_right.png', toolTipText: 'Add blue eyes' },
				{ src: 'cat_pair.png', dataParams: 'cat_left.png, cat_right.png', toolTipText: 'Add cat eyes' },
				{ src: 'detached_pair.png', dataParams: 'detached_left.png, detached_right.png', toolTipText: 'Add detached eyes' },
				{ src: 'goat_pair.png', dataParams: 'goat_right.png, goat_right.png', toolTipText: 'Add goat eyes' },
				{ src: 'purple_pair.png', dataParams: 'purple_left.png, purple_right.png', toolTipText: 'Add purple eyes' },
				{ src: 'red_pair.png', dataParams: 'red_left.png, red_right.png', toolTipText: 'Add red eyes' }
			]
		},
		Noses: {
			ImagesPath: 'Images/FaceAssets/Noses/',
			DataFunction: 'addNose',
			CssClass: 'noses',
			Icons: [
				{ src: 'dog.png', dataParams: 'dog.png', toolTipText: 'Add dog nose' },
				{ src: 'orange.png', dataParams: 'orange.png', toolTipText: 'Add orange nose' },
				{ src: 'pickle.png', dataParams: 'pickle.png', toolTipText: 'Add pickle nose' },
				{ src: 'pig.png', dataParams: 'pig.png', toolTipText: 'Add pig nose' },
				{ src: 'red.png', dataParams: 'red.png', toolTipText: 'Add red nose' }
			]
		},
		Lips: {
			ImagesPath: 'Images/FaceAssets/Lips/',
			DataFunction: 'addLips',
			CssClass: 'lips',
			Icons: [
				{ src: 'buck_tooth.png', dataParams: 'buck_tooth.png', toolTipText: 'Add duck tooth' },
				{ src: 'frog.png', dataParams: 'frog.png', toolTipText: 'Add frog mouth' },
				{ src: 'pink.png', dataParams: 'pink.png', toolTipText: 'Add pink lips' },
				{ src: 'underbite.png', dataParams: 'underbite.png', toolTipText: 'Add underbite mouth' },
				{ src: 'vampire.png', dataParams: 'vampire.png', toolTipText: 'Add vampire mouth' }
			]
		},
		Hair: {
			ImagesPath: 'Images/FaceAssets/Hair/',
			DataFunction: 'addHair',
			CssClass: 'hair',
			Icons: [
				{ src: 'blonde.png', dataParams: 'blonde.png', toolTipText: 'Add blonde hair' },
				{ src: 'brown.png', dataParams: 'brown.png', toolTipText: 'Add brown hair' },
				{ src: 'clump.png', dataParams: 'clump.png', toolTipText: 'Add clump hair' },
				{ src: 'patch.png', dataParams: 'patch.png', toolTipText: 'Add patch hair' },
				{ src: 'thin.png', dataParams: 'thin.png', toolTipText: 'Add thin hair' }
			]
		},
		Props: {
			ImagesPath: 'Images/FaceAssets/Props/',
			DataFunction: 'addProps',
			CssClass: 'props',
			Icons: [
				{ src: 'ladybug.png', dataParams: 'ladybug.png', toolTipText: 'Add ladybug' },
				{ src: 'mole.png', dataParams: 'mole.png', toolTipText: 'Add mole' },
				{ src: 'piercing.png', dataParams: 'piercing.png', toolTipText: 'Add piercing' },
				{ src: 'pimple.png', dataParams: 'pimple.png', toolTipText: 'Add pimple' },
				{ src: 'tear.png', dataParams: 'tear.png', toolTipText: 'Add tear' }
			]
		},
		Filters: {
			ImagesPath: 'Images/Filters/',
			DataFunction: 'filter',
			CssClass: 'filter',
			Icons: [
				{ src: 'filters_nofilter.png', dataParams: 'nofilter', toolTipText: 'Reset filter' },
				{ src: 'filters_grayscale.png', dataParams: 'grayscale', toolTipText: 'Grayscale' },
				{ src: 'filters_invert.png', dataParams: 'invert', toolTipText: 'Invert' },
				{ src: 'filters_brighter.png', dataParams: 'brighter', toolTipText: 'Brightness' },
				{ src: 'filters_darker.png', dataParams: 'darker', toolTipText: 'Darkness' },
				{ src: 'filters_sat.png', dataParams: 'saturation', toolTipText: 'Saturation' },
				{ src: 'filters_desat.png', dataParams: 'desaturation', toolTipText: 'Desaturation' }
			]
		}
	};

	var topMenu = {
		init: function (im) {
			imageHandler = im;

			this.initAssets();
			this.initIconsEvents();
			this.initToolTips();
		},

		initAssets: function () {
			createAssets();
		},

		initIconsEvents: function () {
			var objTarget, func, param;

			$('.assets > img')
				.mouseenter(function () {
					$(this).addClass('zoomInImg');
				})
				.mouseleave(function () {
					$(this).removeClass('zoomInImg');
				});

			if (document.msElementsFromPoint) {
				document.querySelector(".assetsOverlay").addEventListener("click", function (e) {
					var targets = document.msElementsFromPoint(e.clientX, e.clientY);

					if (targets.length > 0 && targets[0] !== undefined) {
						objTarget = targets[0];

						func = objTarget.getAttribute("data-function");
						param = objTarget.getAttribute("data-params");

						if (func !== undefined && NewGame.TopMenu[func] !== undefined && param !== undefined && param !== "") {
							NewGame.TopMenu[func].call(window, param);
						}
					}
				}, false);
			}
		},

		initToolTips: function () {
			var toolTipContextualFragment = createToolTip();

			if (toolTipContextualFragment !== null) {
				$(".assets > img")
					.mouseenter(function (e) {
						showTooltip(e, toolTipContextualFragment);
					})
					.mouseleave(function () {
						hideTooltip();
					});

			}
		},

		addEyes: function (assets) {
			var asset = splitAndTrimAsset(assets, 2);

			if (asset !== null) {
				imageHandler.addImage("Images/FaceAssets/Eyes/" + asset[0], "eye_left", { w: 100, x: 50, y: 0 });
				imageHandler.addImage("Images/FaceAssets/Eyes/" + asset[1], "eye_right", { w: 100, x: 170, y: 0 });
			}
		},

		addNose: function (assets) {
			var asset = splitAndTrimAsset(assets);

			if (asset !== null) {
				imageHandler.addImage("Images/FaceAssets/Noses/" + asset, "noses", { w: 100, x: 50, y: 0 });
			}
		},

		addLips: function (assets) {
			var asset = splitAndTrimAsset(assets);

			if (asset !== null) {
				imageHandler.addImage("Images/FaceAssets/Lips/" + asset, "lips", { w: 150, x: 50, y: 0 });
			}
		},

		addHair: function (assets) {
			var asset = splitAndTrimAsset(assets);

			if (asset !== null) {
				imageHandler.addImage("Images/FaceAssets/Hair/" + asset, "hair", { h: 100, x: 50, y: 0 });
			}
		},

		addProps: function (assets) {
			var asset = splitAndTrimAsset(assets);

			if (asset !== null) {
				imageHandler.addImage("Images/FaceAssets/Props/" + asset, "props" + (Math.floor(Math.random() * 10000)), { w: 50, x: 50, y: 0 });
			}
		},

		filter: function (preDefinedFilter) {
			if (!isAppliedFilter) {
				imageHandler.applyFilter(preDefinedFilter);
			}
		}
	};

	function splitAndTrimAsset(assets, assetsCount) {
		if (assets !== undefined && assets !== "") {
			if (assets.indexOf(',') > 1) {
				var asset = assets.split(',');

				if (asset.length === assetsCount) {
					for (var i = 0; i < asset.length; i++) {
						asset[i] = $.trim(asset[i]);
					}

					return asset;
				}
			}
			else {
				return $.trim(assets);
			}
		}

		alert('Error inserting the Assets. Contact the administrator');
		return null;
	}

	function createAssets() {
		var imgContainerClass = 'assets';
		var imgContainerIdPrefix = 'asset';

		var assetsOverlay = $('<div class="assetsOverlay"/>');

		for (var assetProp in assetsJson) {
			var asset = assetsJson[assetProp];

			if (asset.hasOwnProperty('ImagesPath') && asset.hasOwnProperty('DataFunction') && asset.hasOwnProperty('CssClass') && asset.hasOwnProperty('Icons')) {

				var assetContainer = $(['<div class="', imgContainerClass, '" id="', imgContainerIdPrefix, assetProp, '">'].join(''));

				for (var i = 0; i < asset.Icons.length; i++) {
					var icon = asset.Icons[i];

					var imgTag = ['<img src="', asset.ImagesPath, icon.src, '" data-function="', asset.DataFunction, '" data-params="', icon.dataParams, '" class="', asset.CssClass, '" data-toolTipText="', icon.toolTipText, '" />'].join('');

					assetContainer.append(imgTag);
				}

				assetsOverlay.append(assetContainer);
			}
		}

		var assetsWrapper = $('<div class="assetsWrapper"/>').append(assetsOverlay);

		$('#mainSection').prepend(assetsWrapper);
	}

	function createToolTip() {
		var htmlTxt, rangeObj, contextualFragment;

		if (document.createRange) {
			rangeObj = document.createRange();

			if (rangeObj.createContextualFragment) {
				htmlTxt = "<div class=\"toolTip\"></div>";

				try {
					contextualFragment = rangeObj.createContextualFragment(htmlTxt);

					return contextualFragment;
				}
				catch (e) {
					// Some browsers don't support this method correctly,
					// so an error is being thrown.
				}

				return null;
			}
		}

		return null;
	}

	function showTooltip(e, toolTipContextualFragment) {
		//Insert the tool tip to body if ContextualFragment has an object
		if (toolTipContextualFragment.childNodes.length === 1) {
			document.body.insertBefore(toolTipContextualFragment, document.body.firstChild);
		}

		var x, y, toolTip = $('.toolTip');

		if (toolTip.length) {
			toolTip.html($(e.target).attr('data-toolTipText'));

			x = $(e.currentTarget).offset().left - (toolTip.width() - e.currentTarget.clientWidth) / 2;
			y = $('.assetsWrapper').position().top + $('.assetsWrapper').height() - (toolTip.height() / 2);

			toolTip.css("left", x);
			toolTip.css("top", y);

			toolTip.show();
		}
	}

	function hideTooltip() {
		$('.toolTip').hide();
	}

	window.NewGame.TopMenu = topMenu;
} ());