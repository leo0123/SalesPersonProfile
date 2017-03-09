
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

//module.exports=myConfig;
