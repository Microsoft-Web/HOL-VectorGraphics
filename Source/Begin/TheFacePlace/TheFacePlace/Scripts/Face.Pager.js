(function () {
	"use strict";
	if (!face.pager) {
		face.pager = {
			currentPage: 0,
			totalItems: 0,
			pageSize: 19,
			getTotalPages: function () {
				return Math.ceil((this.totalItems - 1) / this.pageSize);
			}
		};
	}
}( ));
