///////////////////////////////////////////////////////////////////////
//  DashedRect
///////////////////////////////////////////////////////////////////////
/**
* Dashed Rect constructor
* @param {Object} config
*/
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

/*
* DashedRect methods
*/
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

// extend Geometry
Kinetic.GlobalObject.extend(Kinetic.DashedRect, Kinetic.Shape);

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