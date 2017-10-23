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
    $scope.isReadOnly = true;
    $scope.noBG = true;
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
            } else {
              DomainAccountUrl += " and Department eq '"+Department+"'";
            }
            init();
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
        //d.ntaccount = d.ntaccount.trim();
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
        if (tmp.BG) {
          $scope.noBG = false;
        }
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
        $scope.RequestPermissionFull = "(DomainAccount='" + $scope.DomainAccount + "')"
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
            if ($scope.SalesOrg.toString() == lastSalesOrg && $scope.Divisions != null && $scope.Divisions.length > 0) {
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

    //init();
    $("#btSave").click(function() {
        checkAndSaveToSP();
    });
    $("#btCancel").click(function() {
        //$("[value='Cancel']:first").click();
        //msg.text(myUtility.formatSPSourceUrl(myUtility.getParam("Source")));
        backToSPListPage();
    });

    function checkAndSaveToSP() {
        if ($scope.isNew && $scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            msg.text("change Domain Account incompleted");
            return;
        }
        if (!$scope.SalesOrg || !$scope.Division || !$scope.Memo || !$scope.SalesOrg.length || !$scope.Division.length) {
          let text = "";
          text += !$scope.SalesOrg || !$scope.SalesOrg.length?"SalesOrg ":"";
          text += !$scope.Division || !$scope.Division.length?"Division ":"";
          text += $scope.Memo?"":"Memo ";
          msg.text(text + " cannot be empty");
          return;
        }
        $scope.DomainAccount = $scope.DomainAccount.trim();
        if (!$scope.Memo) {
          msg.text("Memo is required");
          if ($scope.notAdmin) {
              return;
          }
        }
        SPHelper.saveToSP(listName, !$scope.isNew, function() {
            msg.text("saved");
            backToSPListPage();
        });
    };

    function backToSPListPage() {
        STSNavigate(decodeURIComponent(myUtility.getParam("Source")));
        //msg.text(decodeURIComponent(myUtility.getParam("Source")));
    };
    PreSaveAction = function() {
        //TODO check exist
        checkAndSaveToSP();
        return false;
    };
    function getUpdateSql() {
      var condition = $scope.RequestPermission.replace(/'/g, "''");
      $scope.SQL = "update [SAPBW3Production].[spp].[vUsersLine]"
                  +" set Condition='"+condition+"'"
                  +" where UserName='"+$scope.Email+"'";
    }
    $scope.openPermissionEditor = function() {
        if (!$scope.myPermissionFormUrl) {
            $scope.myPermissionFormUrl = myPermissionFormUrl;
            $scope.myPermissionFormReady = function() {
                myPermissionHelper.save = function(RequestPermission, JSONStr) {
                    $scope.RequestPermission = RequestPermission;
                    $scope.RequestPermissionFull = RequestPermission + " or (DomainAccount='" + $scope.DomainAccount + "')"
                    $scope.JSONStr = JSONStr;
                    getUpdateSql();
                };
                myPermissionHelper.close = function() {
                    $scope.showPermission = false;
                };
                $scope.openPermissionEditor();
            };
        } else {
            $scope.showPermission = !$scope.showPermission;
            myPermissionHelper.load($scope.BG, $scope.RequestPermission, $scope.JSONStr);
        }
    };
});
