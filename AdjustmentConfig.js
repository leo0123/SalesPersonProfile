var myAdjustmentConfig = myAdjustmentConfig || {};
myAdjustmentConfig.myFormUrl = _spPageContextInfo.siteServerRelativeUrl + '/SiteAssets/SPP/MyAdjustmentForm.html';
myAdjustmentConfig.SPServerUrl = _spPageContextInfo.siteAbsoluteUrl + "/";
myAdjustmentConfig.dataServiceUrl = "http://amdpfweb02:9999/SAPBW3DataService.svc/";
myAdjustmentConfig.AdjustmentListUrl = myAdjustmentConfig.SPServerUrl + "_api/web/lists/GetById('" + _spPageContextInfo.pageListId + "')/items";
console.log("local config");
console.log(myAdjustmentConfig.SPServerUrl + "_api/web/lists/GetById('" + _spPageContextInfo.pageListId + "')");
