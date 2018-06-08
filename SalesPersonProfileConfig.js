var mySalesPersonProfileConfig = mySalesPersonProfileConfig || {};

mySalesPersonProfileConfig.SPPPath = _spPageContextInfo.siteServerRelativeUrl + "/SiteAssets/SPP/";
mySalesPersonProfileConfig.myFormUrl = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileForm.html';
mySalesPersonProfileConfig.myPermissionFormUrl = mySalesPersonProfileConfig.SPPPath + 'MyPermissionForm.html';
mySalesPersonProfileConfig.myDisplaySectionUrl = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileDisplay.html';

mySalesPersonProfileConfig.SPServerUrl = _spPageContextInfo.siteAbsoluteUrl + "/";
mySalesPersonProfileConfig.SPUserProfileUrl = mySalesPersonProfileConfig.SPServerUrl + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
mySalesPersonProfileConfig.SalesPersonProfileListUrl = mySalesPersonProfileConfig.SPServerUrl + "_api/web/lists/GetById('" + _spPageContextInfo.pageListId + "')/items";

mySalesPersonProfileConfig.dataServiceUrl = "http://amdpfweb02.delta-corp.com:9999/SAPBW3DataService.svc/";

mySalesPersonProfileConfig.myPermissionHelper = {};

console.log("local config");
