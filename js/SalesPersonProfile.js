var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myPermissionCtrl = require("./MyPermissionCtrl.js");
var SPPFieldsConfig = require("./SalesPersonProfileFields.js");
var myUtility = require("./Utility.js");

var config = mySalesPersonProfileConfig;
var myFormUrl = config.myFormUrl;
var myPermissionFormUrl = config.myPermissionFormUrl;

var SPServerUrl = config.SPServerUrl;
var SPUserProfileUrl = config.SPUserProfileUrl;
var SPPListUrl = config.SalesPersonProfileListUrl;

var dataServiceUrl = config.dataServiceUrl;

var myPermissionHelper = config.myPermissionHelper;

var headers = {
    "accept": "application/json;odata=verbose"
};
var currentUserUrl = SPServerUrl + "_api/SP.UserProfiles.PeopleManager/GetMyProperties";
var DomainAccountUrl = dataServiceUrl + "vSalesPersonAccount4Profile/?$filter=ntaccount ne ''";
var listName = "SalesPersonProfile";

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myPermissionCtrl", myPermissionCtrl);
myApp.controller("myCtrl", function($scope, $http) {
    $scope.notAdmin = true;
    $scope.isReadOnly = false;
    $scope.isNew = $("#myFormType").text() == "new" ? true : false;
    var msg = $("#msg");
    var HttpGet = myUtility.buildHttpGet($http, myError);
    var SPHelper = myUtility.buildSPHelper({
        $scope: $scope,
        fieldsConfig: SPPFieldsConfig,
        SPList: SPPListUrl,
        SPServer: SPServerUrl,
        $http: $http,
    });

    getCurrentUserInfo();

    function getCurrentUserInfo() {
        HttpGet(currentUserUrl, function(result) {
            var Department = result.d.UserProfileProperties.results.find(function getDept(prop) {
                return prop.Key == "Department";
            }).Value;
            if (Department == "IT") {
                $scope.notAdmin = false;
            }
        });
    };

    function init() {
        if ($scope.isNew) {
            loadData(DomainAccountUrl, "DomainAccounts");
            $scope.PortalSalesRole = true;
        } else {
            SPHelper.loadFromSP(null, myError);
            $scope.loadSalesOrg(true);
            $scope.loadDivision(true);
        }
    };

    function loadData(url, optionName) {
        HttpGet(url, function(result) {
            $scope[optionName] = result.d;
        });
    };

    function myError(response) {
        msg.text(response.status);
    };

    $scope.selectedDomainAccountChanged = function(type) {
        msg.text("");
        var d = $scope.selectedDomainAccount;
        var tmp = {};
        tmp.EmployeeID = d.Race;
        tmp.EmployeeCode = d.Emp_Code;
        tmp.SalesP = d.SalesP;
        tmp.Status = d.Status;
        tmp.TerminateDate = d.Terminate_Date;
        if (tmp.TerminateDate) {
            tmp.TerminateDate = new Date(parseInt(tmp.TerminateDate.substr(6)));
        }
        for (var key in tmp) {
            $scope[key] = tmp[key];
        }
        var aSPUserProfileUrl = SPUserProfileUrl + "'delta\\" + d.ntaccount + "'";
        HttpGet(aSPUserProfileUrl, loadSPUserProfileSuccess);
    };

    function loadSPUserProfileSuccess(result) {
        var d = result.d;
        if (!d.DisplayName) {
            msg.text("can't get user information from sharepoint");
            return;
        }
        var tmp = {};
        tmp.Name = d.DisplayName;
        tmp.Email = d.Email;
        tmp.BG = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Department";
        }).Value;
        tmp.Company = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Company";
        }).Value;
        tmp.Office = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Office";
        }).Value;
        for (var key in tmp) {
            $scope[key] = tmp[key];
        }
        if ($scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            $scope.SalesOrg = null;
            clearDivision();
        }
        $scope.DomainAccount = $scope.selectedDomainAccount.ntaccount;
        $scope.loadSalesOrg(false);
    };

    var lastCompany;
    var lastCompanyToken;
    $scope.loadSalesOrg = function(callByLoad) {
        if (!$scope.Company) {
            clearSalesOrg();
            return;
        }
        if (!callByLoad) {
            if ($scope.Company == lastCompany && $scope.SalesOrgs) {
                return;
            }
            if (lastCompany && $scope.Company != lastCompany) {
                clearSalesOrg();
            }
        }
        lastCompanyToken = new Date().getTime();
        var SalesOrgUrl = dataServiceUrl + "vCompanyOrg4Profile/?$filter=Company eq '" + $scope.Company + "'&t=" + lastCompanyToken;
        HttpGet(SalesOrgUrl, loadSalesOrgSuccess);
    };

    function loadSalesOrgSuccess(result, url) {
        if (!url.endsWith("&t=" + lastCompanyToken)) {
            return;
        }
        $scope.SalesOrgs = result.d;
        lastCompany = $scope.Company;
    };

    $scope.SalesOrgChanged = function() {
        if (lastSalesOrg && $scope.SalesOrg.toString() != lastSalesOrg) {
            clearDivision(); //TODO better check belong SalesOrg
            lastSalesOrg = $scope.SalesOrg.toString();
        }
    };

    function clearSalesOrg() {
        $scope.SalesOrg = null;
        $scope.SalesOrgs = null;
        clearDivision();
    };

    function clearDivision() {
        $scope.Division = null;
        $scope.Divisions = null;
    };

    var lastSalesOrg;
    var lastSalesOrgToken;
    $scope.loadDivision = function(callByLoad) {
        if (!$scope.SalesOrg) {
            clearDivision();
            return;
        }
        if (!callByLoad) {
            if ($scope.SalesOrg.toString() == lastSalesOrg && $scope.Divisions) {
                return;
            }
            if (lastSalesOrg && $scope.SalesOrg.toString() != lastSalesOrg) {
                clearDivision();
            }
        }

        var orgList = $scope.SalesOrg;
        var filter;
        for (var org in orgList) {
            if (filter) {
                filter += " or SalesOrg eq '" + orgList[org] + "'";
            } else {
                filter = "SalesOrg eq '" + orgList[org] + "'";
            }
        }
        lastSalesOrgToken = new Date().getTime();
        var DivisionUrl = dataServiceUrl + "vSalesOrgDivision4Profile/?$filter=" + filter + "&&$orderby=Division&t=" + lastSalesOrgToken;
        HttpGet(DivisionUrl, loadDivisionSuccess);
    }

    function loadDivisionSuccess(result, url) {
        if (!url.endsWith("&t=" + lastSalesOrgToken)) {
            return;
        }
        $scope.Divisions = distinctDivisions(result.d);
        lastSalesOrg = $scope.SalesOrg.toString();
    };

    function distinctDivisions(oList) {
        var tList = [];
        var vList = [];
        for (var i in oList) {
            if (!tList.includes(oList[i].Division)) {
                tList.push(oList[i].Division);
            }
        }
        return tList;
    };

    init();
    $("#btSave").click(function() {
        checkAndSaveToSP();
    });
    $("#btCancel").click(function() {
        //$("[value='Cancel']:first").click();
        backToSPListPage();
    });

    function checkAndSaveToSP() {
        if ($scope.isNew && $scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            msg.text("change Domain Account incompleted");
            return;
        }
        SPHelper.saveToSP(listName, !$scope.isNew, function() {
            msg.text("saved");
            backToSPListPage();
        });
    };

    function backToSPListPage() {
        STSNavigate(myUtility.formatSPSourceUrl(myUtility.getParam("Source")));
    };
    PreSaveAction = function() {
        //TODO check exist
        checkAndSaveToSP();
        return false;
    };
    $scope.openPermissionEditor = function() {
        if (!$scope.myPermissionFormUrl) {
            $scope.myPermissionFormUrl = myPermissionFormUrl;
            $scope.myPermissionFormReady = function() {
                myPermissionHelper.save = function(Permission, JSONStr) {
                    $scope.Permission = Permission;
                    $scope.JSONStr = JSONStr;
                };
                myPermissionHelper.close = function() {
                    $scope.showPermission = false;
                };
                $scope.openPermissionEditor();
            };
        } else {
            $scope.showPermission = !$scope.showPermission;
            myPermissionHelper.load($scope.BG, $scope.Permission, $scope.JSONStr);
        }
    };
});
