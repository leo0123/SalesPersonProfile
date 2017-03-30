var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myPermissionCtrl = require("./MyPermissionCtrl.js");
var SPPFieldsConfig = require("./SalesPersonProfileFields.js")
var myUtility = require("./Utility.js")

var config = mySalesPersonProfileConfig;
var myFormUrl = config.myForm;
var myPermissionFormUrl = config.myPermissionForm;

var SPServer = config.SPServer;
var SPUserProfile = config.SPUserProfile;
var SPPList = config.SalesPersonProfileList;

var dataService = config.dataService;

var myPermissionHelper = config.myPermissionHelper;

var headers = {
    "accept": "application/json;odata=verbose"
};
var DomainAccountUrl = dataService + "vSalesPersonAccount4Profile/?$filter=ntaccount ne ''";
var listName = "SalesPersonProfile";
var fieldsHelper = myUtility.FieldsHelper;

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myPermissionCtrl", myPermissionCtrl);
myApp.controller("myCtrl", function($scope, $http) {
    $scope.isReadOnly = false;
    $scope.isNew = $("#myFormType").text() == "new" ? true : false;
    var msg = $("#msg");

    function init() {
        fieldsHelper.init($http,$scope,SPPFieldsConfig,SPPList,SPServer);
        if ($scope.isNew) {
            loadData(DomainAccountUrl, "DomainAccounts");
        } else {
            fieldsHelper.loadFromSP(null, myError);
            $scope.loadSalesOrg(true);
            $scope.loadDivision(true);
        }
    };

    function loadData(url, optionName, mySuccess) {
        $http({
            method: "GET",
            url: url,
            headers: headers
        }).then(function success(response) {
            if (mySuccess) {
                mySuccess(response);
            } else {
                $scope[optionName] = response.data.d;
            }
        }, myError);
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
        var aSPUserProfileUrl = SPUserProfile + "'delta\\" + d.ntaccount + "'";
        loadData(aSPUserProfileUrl, null, loadSPUserProfileSuccess);
    };

    function loadSPUserProfileSuccess(response) {
        var d = response.data.d;
        if (!d.DisplayName) {
            msg.text("can't get user information from sharepoint");
            return;
        }
        var tmp = {};
        tmp.Name = d.DisplayName;
        tmp.Email = d.Email;
        tmp.BG = d.UserProfileProperties.results.find(function (prop) {
            return prop.Key == "Department";
        }).Value;
        tmp.Company = d.UserProfileProperties.results.find(function (prop) {
            return prop.Key == "Company";
        }).Value;
        tmp.Office = d.UserProfileProperties.results.find(function (prop) {
            return prop.Key == "Office";
        }).Value;
        for (var key in tmp) {
            $scope[key] = tmp[key];
            //spFields[key].val(tmp[key]);
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
        var SalesOrgUrl = dataService + "vCompanyOrg4Profile/?$filter=Company eq '" + $scope.Company + "'&t=" + lastCompanyToken;
        loadData(SalesOrgUrl, null, loadSalesOrgSuccess);
    };

    function loadSalesOrgSuccess(response) {
        if (!response.config.url.endsWith("&t=" + lastCompanyToken)) {
            return;
        }
        $scope.SalesOrgs = response.data.d;
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
        var DivisionUrl = dataService + "vSalesOrgDivision4Profile/?$filter=" + filter + "&&$orderby=Division&t=" + lastSalesOrgToken;
        loadData(DivisionUrl, null, loadDivisionSuccess);
    }

    function loadDivisionSuccess(response) {
        if (!response.config.url.endsWith("&t=" + lastSalesOrgToken)) {
            return;
        }
        $scope.Divisions = distinctDivisions(response.data.d);
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
        //$("[value='Save']:first").click();
        save();
    });
    $("#btCancel").click(function() {
        $("[value='Cancel']:first").click();
    });

    function save() {
        if ($scope.isNew && $scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            msg.text("change Domain Account incompleted");
            return;
        }
        fieldsHelper.saveToSP(listName, !$scope.isNew, function() {
            msg.text("saved");
        });
    };
    PreSaveAction = function() {
        //TODO check exist
        //saveToSpFields("all");
        //return false;
        save();
        return false;
        /*if ($scope.isNew && $scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            msg.text("change Domain Account incompleted");
            return false;
        }
        return true;*/
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
