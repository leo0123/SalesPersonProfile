var mySalesPersonProfileConfig = mySalesPersonProfileConfig || {};

mySalesPersonProfileConfig.SPPPath = "/sites/MyDelta/SiteAssets/SPP/";
mySalesPersonProfileConfig.myFormUrl = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileForm.html';
mySalesPersonProfileConfig.myPermissionFormUrl = mySalesPersonProfileConfig.SPPPath + 'MyPermissionForm.html';
mySalesPersonProfileConfig.myDisplaySectionUrl = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileDisplay.html';

mySalesPersonProfileConfig.SPServerUrl = "http://ideltaam.deltaww.com/sites/MyDelta/";
mySalesPersonProfileConfig.SPUserProfileUrl = mySalesPersonProfileConfig.SPServerUrl + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
mySalesPersonProfileConfig.SalesPersonProfileListUrl = mySalesPersonProfileConfig.SPServerUrl + "_api/web/lists/GetByTitle('Sales Person Profile')/items";

mySalesPersonProfileConfig.dataServiceUrl = "http://amdpfweb02.delta-corp.com:9999/SAPBW3DataService.svc/";

mySalesPersonProfileConfig.myPermissionHelper = {};

console.log("local config");
