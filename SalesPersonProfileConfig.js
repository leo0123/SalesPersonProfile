
var myHtmlPath = "../html/";//~/SitePages/
var mySPListServer = "http://amdpfwfe02:9999/";
var myConfig = {
    serviceUrl: "http://amdpfweb02:8080/SAPBW3DataService.svc/",
  	digestUrl: mySPListServer + "_api/contextinfo",
  	permissionHtmlUrl: myHtmlPath+"permission.html",
  	SalesOrgHtmlUrl: myHtmlPath+"SalesOrg.html",
  	DivisionHtmlUrl: myHtmlPath+"Division.html",
  	DomainAccountHtmlUrl: myHtmlPath+"DomainAccount.html",
  	listServer: mySPListServer,
  	SPUserProfileUrl: mySPListServer + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
};
var mySalesPersonProfileConfig = mySalesPersonProfileConfig || {};
mySalesPersonProfileConfig.myFormUrl = '/SitePages/MySalesPersonProfileForm.html';
mySalesPersonProfileConfig.dataService = "http://amdpfweb02:9999/SAPBW3DataService.svc/";
mySalesPersonProfileConfig.SPListServer = "http://amdpfwfe02:9999/";
mySalesPersonProfileConfig.SPUserProfileUrl = mySalesPersonProfileConfig.SPListServer + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
mySalesPersonProfileConfig.myPermissionFormUrl = '/SitePages/MyPermissionForm.html';
mySalesPersonProfileConfig.myPermissionHelper = {};
//module.exports=myConfig;
