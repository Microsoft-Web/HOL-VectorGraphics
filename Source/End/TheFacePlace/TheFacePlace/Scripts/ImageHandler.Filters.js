self.addEventListener('message', function (e) {
	var data;

	switch (e.data.effect) {
		case 'grayscale':
			data = applyFilter(e.data.imageData, grayscale);
			break;
		case 'invert':
			data = applyFilter(e.data.imageData, invert);
			break;
		case 'luminance':
			data = applyFilter(e.data.imageData, luminance);
			break;
		case 'brighter':
			data = brightnessContrast(e.data.imageData, 0.25, 1.5);
			break;
		case 'darker':
			data = brightnessContrast(e.data.imageData, -0.25, 1.5);
			break;
		case 'saturation':
			data = applyFilter(e.data.imageData, saturation);
			break;
		case 'desaturation':
			data = applyFilter(e.data.imageData, desaturation);
			break;
		default:
			data = null;
			break;
	}

	if (data === undefined || data === null) {
		self.postMessage(null);
		return;
	}

	self.postMessage(data);
	return;

}, false);

function applyFilter(imageData, filterFunc) {
	if (filterFunc !== undefined) {
		for (var n = 0; n < imageData.width * imageData.height; n++) {
			var index = n * 4;

			filterFunc(imageData.data, index);
		}

		return imageData;
	} else {
		self.postMessage(filterFunc !== undefined);
		return null;
	}
}

function grayscale(d, i) {
	var r = d[i];
	var g = d[i + 1];
	var b = d[i + 2];

	var v = r * 0.3 + g * 0.59 + b * 0.11;
	d[i] = d[i + 1] = d[i + 2] = v;
}

function invert(d, i) {
	d[i] = 255 - d[i];
	d[i + 1] = 255 - d[i + 1];
	d[i + 2] = 255 - d[i + 2];
}

function luminance(d, i) {
	var r = d[i];
	var g = d[i + 1];
	var b = d[i + 2];
	
	var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	d[i] = v;
	d[i + 1] = v;
	d[i + 2] = v;
}

function brightnessContrast(imageData, brightness, contrast) {
	var lut = brightnessContrastLUT(brightness, contrast);
	var lutJson = { r: lut, g: lut, b: lut, a: identityLUT() };

	return applyFilter(imageData, function (d, i) {
		d[i] = lutJson.r[d[i]];
		d[i + 1] = lutJson.g[d[i + 1]];
		d[i + 2] = lutJson.b[d[i + 2]];
		d[i + 3] = lutJson.a[d[i + 3]];
	});
}

function brightnessContrastLUT(brightness, contrast) {
	var lut = getUint8Array(256);
	var contrastAdjust = -128 * contrast + 128;
	var brightnessAdjust = 255 * brightness;
	var adjust = contrastAdjust + brightnessAdjust;
	for (var i = 0; i < lut.length; i++) {
		var c = i * contrast + adjust;
		lut[i] = c < 0 ? 0 : (c > 255 ? 255 : c);
	}
	return lut;
}

function identityLUT() {
	var lut = getUint8Array(256);
	for (var i = 0; i < lut.length; i++) {
		lut[i] = i;
	}
	return lut;
}

function getUint8Array(len) {
	return new Uint8Array(len);
}

function saturation(d, i) {

	var max = Math.max(d[i], d[i + 1], d[i + 2]);

	if (d[i] !== max) {
		d[i] += (max - d[i]) * -0.7;
	}

	if (d[i + 1] !== max) {
		d[i + 1] += (max - d[i + 1]) * -0.7;
	}

	if (d[i + 2] !== max) {
		d[i + 2] += (max - d[i + 2]) * -0.7;
	}
}

function desaturation(d, i) {
	var max;
	max = Math.max(d[i], d[i + 1], d[i + 2]);

	if (d[i] !== max) {
		d[i] -= (max - d[i]) * -0.7;
	}

	if (d[i + 1] !== max) {
		d[i + 1] -= (max - d[i + 1]) * -0.7;
	}

	if (d[i + 2] !== max) {
		d[i + 2] -= (max - d[i + 2]) * -0.7;
	}
};


function getFloat32Array(len) {
	return new Float32Array(len);
}