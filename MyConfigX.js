require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/MyConfig.js":[function(require,module,exports){
var htmlPath = "../html/";
var SPListServer = "http://amdpfwfe02:9999/";
var myConfig = {
    serviceUrl: "http://amdpfweb02:8080/SAPBW3DataService.svc/",
  	digestUrl: SPListServer + "_api/contextinfo",
  	permissionHtmlUrl: htmlPath+"permission.html",
  	SalesOrgHtmlUrl: htmlPath+"SalesOrg.html",
  	DivisionHtmlUrl: htmlPath+"Division.html",
  	DomainAccountHtmlUrl: htmlPath+"DomainAccount.html",
  	listServer: SPListServer,
  	SPUserProfileUrl: SPListServer + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
};

module.exports=myConfig;

},{}]},{},[]);
