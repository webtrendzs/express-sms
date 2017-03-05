var PagingLoadResult = function(obj) {
	var _ = this;
	this.data = obj.data;
	this.page = obj.page;
	this.pageSize = obj.pageSize;
	this.total = obj.total;
	
	this.offset = function() {
		if(isNaN(_.page))
			_.page = 1;
		return _.page * _.pageSize - _.pageSize;
	};
	
	this.limit = function() {
		return _.pageSize;
	};
	
	this.currentPage = function() {
		_.page;
	};
	
	this.totalLength = function() {
		return parseInt(_.total);
	};
};

module.exports.result = function(obj) {
	return new PagingLoadResult(obj);
};