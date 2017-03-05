exports.render = function (config) {

    var Renderer = function(obj) {

        var _this = this;
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
            if (_this.reqParams != null) {

                if(_this.reqParams instanceof Array) {

                    for(var i = 0; i < _this.reqParams.length; i++) {
                        if(_this.reqParams[i].value && (_this.reqParams[i].value + '').length > 0) {
                            var filter = _this.reqParams[i].name + "=" + _this.reqParams[i].value;
                            _urlStr += _this.endsWith(_urlStr, "?") ? filter : "&" + filter;
                        }

                    }

                } else {

                    for(var key in _this.reqParams) {
                        var filter = key + "=" + _this.reqParams[key];
                        _urlStr += _this.endsWith(_urlStr, "?") ? filter : "&" + filter;
                    }

                }

            }
            return _this.contextURL + _urlStr;
        };

        this.getLinkURL = function(page) {
            if(page < 1)
                page = 1;
            var pageFilter = "page=" + page;
            var url = _this.endsWith(_this.urlStr, "?") ? _this.urlStr + pageFilter : _this.urlStr + "&" + pageFilter;

            var pageSizeFilter = "pageSize=" + _this.loadResult.limit();
            url += _this.endsWith(url, "?") ? pageSizeFilter : "&" + pageSizeFilter;
            return url;
        };

        this.endsWith = function(str, param) {
            var length = param.length;
            return str.substr(-length) === param;
        };

        if(this.loadResult != null) {

            var init = function() {

                _this.urlStr = _this.initUrlStr();
                var pageSize = _this.loadResult.limit();
                var offset = _this.loadResult.offset();
                var total = _this.loadResult.totalLength();

                var startPage = 0;
                var endPage = 0;
                var span = 5;

                if(offset <= 0)
                    offset = 1;
                else
                    offset +=1;

                if(total > 0) {
                    _this.pages = Math.ceil(total/pageSize);
                    _this.currentPage = parseInt(Math.ceil(offset/pageSize));
                    _this.showPaging = _this.pages > 1;

                    if(_this.showPaging) {
                        _this.showPrevious = _this.currentPage > span;

                        var strt = Math.floor((_this.currentPage - 1) /span ) * span + 1.0;

                        startPage = parseInt(strt);
                        endPage = startPage + (span - 1) < _this.pages ? startPage + (span - 1) : parseInt(_this.pages);

                        if(_this.showPrevious)
                            _this.prevURL = _this.getLinkURL(startPage - 1);

                        for(var i = startPage; i <= endPage; i++) {
                            _this.pageUrls.push({
                                "active" : i == _this.currentPage,
                                "url" : _this.getLinkURL(i),
                                "page" : i
                            });
                        }

                        _this.showNext = endPage < _this.pages;
                        if(_this.showNext)
                            _this.nextURL = _this.getLinkURL(endPage + 1);
                    }
                }
            };
            init();
        }
    };

    return new Renderer(config);

};

exports.paginate = function (config) {

    var that=this;

    var PagingLoadResult = function (obj) {
        var _this = this;
        this.data = obj.data;
        this.page = obj.page;
        this.pageSize = obj.pageSize;
        this.total = obj.total;

        this.offset = function () {
            if (isNaN(_this.page))
                _this.page = 1;
            return _this.page * _this.pageSize - _this.pageSize;
        };

        this.limit = function () {
            return _this.pageSize;
        };

        this.currentPage = function () {
            _this.page;
        };

        this.totalLength = function () {
            return parseInt(_this.total);
        };
    };

    function from(PagingLoadResult) {

        return function (resolve, reject) {

            if (PagingLoadResult){

                return resolve({
                    renderer:that,
                    result:PagingLoadResult
                });
            }
            else
                return reject({error: 'Could not instantiate pagination result '});
        }

    }

    return new Promise(from(new PagingLoadResult(config)));

};