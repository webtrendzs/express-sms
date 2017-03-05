var Renderer = function(obj) {
	
	var _ = this;
	this.loadResult = obj.pagingLoadResult;
	this.showPaging = false;
	this.showPrevious = false;
	this.prevURL = "#";
	this.showNext = false;
	this.nextURL = "#";
	this.pageUrls = new Array();
	
	this.currentPage = 0;
	this.pages = 0;
	this.reqParams = obj.params;
	this.contextURL = obj.contextURL;
	this.urlStr = "";
	
	this.initUrlStr = function() {
		var _urlStr = "?";
		if (_.reqParams != null) {
			
			if(_.reqParams instanceof Array) {
				
				for(var i = 0; i < _.reqParams.length; i++) {
					if(_.reqParams[i].value && (_.reqParams[i].value + '').length > 0) {
						var filter = _.reqParams[i].name + "=" + _.reqParams[i].value;
						_urlStr += _.endsWith(_urlStr, "?") ? filter : "&" + filter; 
					}
					
				}
				
			} else {
				
				for(var key in _.reqParams) {
					var filter = key + "=" + _.reqParams[key];
					_urlStr += _.endsWith(_urlStr, "?") ? filter : "&" + filter;
				}
				
			}
			
		}
		return _.contextURL + _urlStr;
	};
	
	this.getLinkURL = function(page) {
		if(page < 1)
			page = 1;
		var pageFilter = "page=" + page;
		var url = _.endsWith(_.urlStr, "?") ? _.urlStr + pageFilter : _.urlStr + "&" + pageFilter;
		
		var pageSizeFilter = "pageSize=" + _.loadResult.limit();
		url += _.endsWith(url, "?") ? pageSizeFilter : "&" + pageSizeFilter;
		return url;
	};
	
	this.endsWith = function(str, param) {
		var length = param.length;
		return str.substr(-length) === param;
	};
	
	if(this.loadResult != null) {
		
		var init = function() {
			
			_.urlStr = _.initUrlStr();
			var pageSize = _.loadResult.limit();
			var offset = _.loadResult.offset();
			var total = _.loadResult.totalLength();
			
			var startPage = 0;
			var endPage = 0;
			var span = 5;
			
			if(offset <= 0)
				offset = 1;
			else
				offset +=1;
			
			if(total > 0) {
				_.pages = Math.ceil(total/pageSize);
				_.currentPage = parseInt(Math.ceil(offset/pageSize));
				_.showPaging = _.pages > 1;
				
				if(_.showPaging) {
					_.showPrevious = _.currentPage > span;
					
					var strt = Math.floor((_.currentPage - 1) /span ) * span + 1.0;
					
					startPage = parseInt(strt);
					endPage = startPage + (span - 1) < _.pages ? startPage + (span - 1) : parseInt(_.pages);
					
					if(_.showPrevious)
						_.prevURL = _.getLinkURL(startPage - 1);
					
					for(var i = startPage; i <= endPage; i++) {
						_.pageUrls.push({
							"active" : i == _.currentPage,
							"url" : _.getLinkURL(i),
							"page" : i
						});
					}
					
					_.showNext = endPage < _.pages;
					if(_.showNext)
						_.nextURL = _.getLinkURL(endPage + 1);
				}
			}
		};
		init();
	};
};

module.exports.renderer = function(obj) {
	return new Renderer(obj);
};