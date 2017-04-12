var myAdjustmentConfig = myAdjustmentConfig || {};
myAdjustmentConfig.myFormUrl = '/sites/MyDelta/SiteAssets/SPP/MyAdjustmentForm.html';
myAdjustmentConfig.SPServerUrl = "http://sp2013portal.delta-corp.com/sites/MyDelta/";
myAdjustmentConfig.dataServiceUrl = "http://amdpfweb02:9999/SAPBW3DataService.svc/";
myAdjustmentConfig.AdjustmentListUrl = myAdjustmentConfig.SPServerUrl + "_api/web/lists/GetByTitle('Adjustment Record')/items";
console.log("local config");
