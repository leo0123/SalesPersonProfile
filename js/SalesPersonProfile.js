var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myPermissionCtrl = require("./MyPermissionCtrl.js");

var myFormUrl = mySalesPersonProfileConfig.myFormUrl;
var SPUserProfileUrl = mySalesPersonProfileConfig.SPUserProfileUrl;
var dataService = mySalesPersonProfileConfig.dataService;
var headers = {
    "accept": "application/json;odata=verbose"
};
var myPermissionFormUrl = mySalesPersonProfileConfig.myPermissionFormUrl;
var myPermissionHelper = mySalesPersonProfileConfig.myPermissionHelper;

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormReady = function() {

    };
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myPermissionCtrl", myPermissionCtrl);
myApp.controller("myCtrl", function($scope, $http) {
    var spFields = {};
    initSpFields();
    $scope.isReadOnly = false;
    $scope.isNew = $("#myFormType").text() == "new" ? true : false;
    var msg = $("#msg");

    function initSpFields() {
        configSpFields(spFields);
        for (var key in spFields) {
            spFields[key].control = $("[title='" + spFields[key].title + "']");
        }
    };

    function saveToSpFields(type) {
        if (type == "checkbox") {
            var spCheckFields = filterSpFields(type);
            for (var key in spCheckFields) {
                spCheckFields[key].control.prop("checked", $scope[key]);
            }
        } else if (type == "text" || type == "array") {
            var spTextFields = filterSpFields(type);
            for (var key in spTextFields) {
                spTextFields[key].control.val($scope[key]);
            }
        } else if (type == "all") {
            saveToSpFields("checkbox");
            saveToSpFields("text");
            saveToSpFields("array");
        }
    };

    function loadFromSpFields(type) {
        if (type == "checkbox") {
            var list = filterSpFields(type);
            for (var key in list) {
                $scope[key] = list[key].control.prop("checked");
            }
        } else if (type == "text") {
            var list = filterSpFields(type);
            for (var key in list) {
                $scope[key] = list[key].control.val();
            }
        } else if (type == "array") {
            var list = filterSpFields(type);
            for (var key in list) {
                $scope[key] = list[key].control.val().split(",");
            }
        } else if (type == "all") {
            loadFromSpFields("checkbox");
            loadFromSpFields("text");
            loadFromSpFields("array");
        }
    };

    function filterSpFields(type) {
        var tmpSpFields = {};
        for (var key in spFields) {
            if (spFields[key].type == type) {
                tmpSpFields[key] = spFields[key];
            }
        }
        return tmpSpFields;
    };

    function init() {
        if ($scope.isNew) {
            loadFromSpFields("checkbox");
            var DomainAccountUrl = dataService + "vSalesPersonAccount4Profile/?$filter=ntaccount ne ''";
            loadData(DomainAccountUrl, "DomainAccounts");
        } else {
            loadFromSpFields("all");
            $scope.loadSalesOrg(true);
            $scope.loadDivision(true);
        }
        //$scope.myPermissionFormUrl = myPermissionFormUrl;
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
        var aSPUserProfileUrl = SPUserProfileUrl + "'delta\\" + d.ntaccount + "'";
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
        tmp.BG = d.UserProfileProperties.results.find(getDept).Value;
        tmp.Company = d.UserProfileProperties.results.find(getCom).Value;
        tmp.Office = d.UserProfileProperties.results.find(getOffice).Value;
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
        $("[value='Save']:first").click();
    });
    $("#btCancel").click(function() {
        $("[value='Cancel']:first").click();
    });
    PreSaveAction = function() {
        //TODO check exist
        saveToSpFields("all");
        //return false;
        if ($scope.isNew && $scope.DomainAccount != $scope.selectedDomainAccount.ntaccount) {
            msg.text("change Domain Account incompleted");
            return false;
        }
        return true;
    };
    $scope.openPermissionEditor = function() {
        if (!$scope.myPermissionFormUrl) {
            $scope.myPermissionFormUrl = myPermissionFormUrl;
            $scope.myPermissionFormReady = function() {
                myPermissionHelper.save = function(Permission, JSONStr) {
                    $scope.Permission = Permission;
                    $scope.JSONStr = JSONStr;
                };
                myPermissionHelper.close = function(){
                    $scope.showPermission = false;
                };
                $scope.openPermissionEditor();
            };
        } else {
            $scope.showPermission = !$scope.showPermission;
            myPermissionHelper.load($scope.BG, $scope.Permission, $scope.JSONStr);
        }
    };

    function getDept(prop) {
        return prop.Key == "Department";
    };

    function getCom(prop) {
        return prop.Key == "Company";
    };

    function getOffice(prop) {
        return prop.Key == "Office";
    };
});

function configSpFields(spFields) {
    spFields.PortalSalesRole = {
        title: "Portal Sales Role",
        type: "checkbox"
    };
    spFields.ApplyEmployeeID = {
        title: "Apply Employee ID",
        type: "checkbox"
    };
    spFields.ApplySAPAccount = {
        title: "Apply SAP Account",
        type: "checkbox"
    };
    spFields.Company = {
        title: "Company",
        type: "text"
    };
    spFields.SalesOrg = {
        title: "Sales Org",
        type: "array"
    };
    spFields.Division = {
        title: "Division",
        type: "array"
    };
    spFields.DomainAccount = {
        title: "Domain Account Required Field",
        type: "text"
    };
    spFields.Name = {
        title: "Name Required Field",
        type: "text"
    };
    spFields.Department = {
        title: "Department",
        type: "text"
    };
    spFields.Email = {
        title: "Email",
        type: "text"
    };
    spFields.EmployeeID = {
        title: "Employee ID",
        type: "text"
    };
    spFields.EmployeeCode = {
        title: "Employee Code",
        type: "text"
    };
    spFields.SalesP = {
        title: "SalesP",
        type: "text"
    };
    spFields.Status = {
        title: "Status",
        type: "text"
    };
    spFields.TerminateDate = {
        title: "Terminate Date",
        type: "text"
    };
    spFields.Office = {
        title: "Office",
        type: "text"
    };
    spFields.Permission = {
        title: "Permission",
        type: "text"
    };
    spFields.JSONStr = {
        title: "JSONStr",
        type: "text"
    };
    spFields.BG = {
        title: "BG",
        type: "text"
    };
};
