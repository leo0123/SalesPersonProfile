//var myConfig = require("../MyConfig.js");
var myPermissionModel = myPermissionModel || {};

//var htmlPath = "../html/";
//var htmlPath = "../../SitePages/";
var headers = {
    "accept": "application/json;odata=verbose"
};

/*myPermissionModel.UrlList = {
	//serviceUrl: myConfig.serviceUrl,
	serviceUrl: mySalesPersonProfileConfig.dataService,
	digestUrl: myConfig.digestUrl,
	permissionHtmlUrl: myConfig.permissionHtmlUrl,
	SalesOrgHtmlUrl: myConfig.SalesOrgHtmlUrl,
	DivisionHtmlUrl: myConfig.DivisionHtmlUrl,
	DomainAccountHtmlUrl: myConfig.DomainAccountHtmlUrl,
	listServer: myConfig.listServer,
	SPUserProfileUrl: myConfig.SPUserProfileUrl
};*/

var serviceUrl = mySalesPersonProfileConfig.dataServiceUrl;

myPermissionModel.OptionManager = function () {
	var self = this;

	this.TypeList = {
		BG: "BG",
		//SalesP: "SalesP",
		DomainAccount: "DomainAccount",
		Office: "Office",
		SalesOffice: "[Sales Office]",
		SalesType: "[Sales Type]",
		ProfitCenter: "ProfitCenter",
		EndCustomer: "[End Customer]",
		SoldToCustomer: "CustName"
	};

	this.isSalesP=function(field){
		if (field.toLowerCase()=="salesp"){
			return true;
		} else {
			return false;
		}
	};

	this.OperationList = ["=", "like"];

	var optionLists = {};
	(function initOptionLists() {
		for (var key in self.TypeList) {
			optionLists[key] = [];
		}
	})();

	this.getStandardField = function (field) {
		for (var key in self.TypeList) {
			if (field.toLowerCase() == self.TypeList[key].toLowerCase()) {
				return self.TypeList[key];
			}
		}
		return field
	};
	this.getType = function (field) {
		for (var key in self.TypeList) {
			if (field.toLowerCase() == self.TypeList[key].toLowerCase()) {
				return key;
			}
		}
		throw "unknown field";
	};

	/*this.getList = function (type) {
	return optionLists[type];
	};*/

	function cacheList(type, list) {
		optionLists[type] = list;
	};

	//var serviceUrl = myPermissionModel.UrlList.serviceUrl;
	var queryList = [];

	var theBG;
	var http;
	var scope;
	var viewSuffix;
	var needInit = true;
	this.init = function (_theBG, _http, _scope, _viewSuffix) {
		if (needInit) {
			theBG = _theBG;
			http = _http;
			scope = _scope;
			viewSuffix = _viewSuffix;
			needInit = false;
		}
	}

	function getFilter(type, theBG, partValue) {
		type = self.TypeList[type];
		var filter;
		if (type == self.TypeList.ProfitCenter) {
			filter = "BG eq '" + theBG + "'";
		} else if (type == self.TypeList.EndCustomer) {
			filter = "BG eq '" + theBG + "'";
		} else if (type == self.TypeList.DomainAccount) {
			filter = "BG eq '" + theBG + "'";
		} else if (type == self.TypeList.ProfitCenter) {
			filter = "BG eq '" + theBG + "'";
		} else if (type == self.TypeList.SoldToCustomer) {
			//filter = "BG eq '" + theBG + "'";
			filter = "";
		} else {
			filter = "";
		}
		if (partValue) {
			filter += filter ? " and " : "";
			filter += "indexof(Value, '" + partValue + "') ge 0"
		}
		filter = filter ? "&$filter=" + filter : "";
		return filter;
	};

	var errorCount = 0;
	function load1Option() {
		if (queryList.length == 0) {
			return;
		}
		var type = queryList[0].type;
		var filter = getFilter(type, theBG, queryList[0].partValue);
		var urlStr = serviceUrl + "vDim" + type + "4SalesProfile?$orderby=Value" + filter;
		http({
			method: "GET",
			url: urlStr,
			headers: headers
		}).then(function mySucces(response) {
			var item = queryList.shift();
			cacheList(item.type, response.data.d);
			if (optionLists[item.type].length) {
				scope[item.viewName] = optionLists[item.type];
				if (item.callBack) {
					item.callBack();
				}
			}
			load1Option();
		}, function myError(response) {
			var item = queryList.shift();
			errorCount++;
			if (errorCount < 99) {
				queryList.push(item);
			} else {
				errorCount = 0;
			}
			load1Option();
		});
	};

	function putIntoQueue(_type, _viewName, _partValue, _callBack) {
		queryList.push({
			type: _type,
			partValue: _partValue,
			viewName: _viewName,
			callBack: _callBack
		});
		if (queryList.length == 1) {
			load1Option();
		}
	}

	this.tryToGetOption = function (_type, _isCommon, _partValue, _callBack) {
		if (needInit) {
			log("need init to get option");
			return;
		}
		var _viewName = _isCommon ? "commonList" : _type + viewSuffix;
		if (_partValue) {
			putIntoQueue(_type, _viewName, _partValue, _callBack);
			return;
		}
		if (optionLists[_type].length) {
			scope[_viewName] = optionLists[_type];
			if (_callBack) {
				_callBack();
			}
		} else {
			putIntoQueue(_type, _viewName, _partValue, _callBack);
		}
	}
};

module.exports=myPermissionModel;
