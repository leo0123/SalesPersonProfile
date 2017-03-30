var mySalesPersonProfileConfig = mySalesPersonProfileConfig || {};

mySalesPersonProfileConfig.SPPPath = "/sites/MyDelta/SiteAssets/SPP/";
mySalesPersonProfileConfig.myForm = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileForm.html';
mySalesPersonProfileConfig.myPermissionForm = mySalesPersonProfileConfig.SPPPath + 'MyPermissionForm.html';
mySalesPersonProfileConfig.myDisplaySectionUrl = mySalesPersonProfileConfig.SPPPath + 'MySalesPersonProfileDisplay.html';

mySalesPersonProfileConfig.SPServer = "http://sp2013portal.delta-corp.com/sites/MyDelta/";
mySalesPersonProfileConfig.SPUserProfile = mySalesPersonProfileConfig.SPServer + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
mySalesPersonProfileConfig.SalesPersonProfileList = mySalesPersonProfileConfig.SPServer + "_api/web/lists/GetByTitle('Sales Person Profile')/items";

mySalesPersonProfileConfig.dataService = "http://amdpfweb02:9999/SAPBW3DataService.svc/";

mySalesPersonProfileConfig.myPermissionHelper = {};
