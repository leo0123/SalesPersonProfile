var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myUtility = require("./Utility.js");
var SPFieldsConfig = require("./AdjustmentFields.js")

var SPHelper = myUtility.SPHelper;
var myFormUrl = myAdjustmentConfig.myFormUrl;
var listServer = myAdjustmentConfig.listServer;
var dataService = myAdjustmentConfig.dataService;
var vSalesCustomerUrl = dataService + "vSalesCustomer";
var currentUserUrl = listServer + "_api/SP.UserProfiles.PeopleManager/GetMyProperties";
var profileListUrl = dataService + "vSalesPersonProfile";
var queryActualBudgetUrl = dataService + "getActualBudget";
var queryNextBatchNum = dataService + "getNextAdjustBatchNum";
var headers = myAdjustmentConfig.headers;

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myCtrl", function($scope, $http) {
    $scope.notAdmin = true;
    const isNew = $("#myFormType").text() == "new" ? true : false;
    var msg = $("#msg");
    var currentUser = {};

    getCurrentUserInfo();

    function getCurrentUserInfo() {
        httpget(currentUserUrl, function mySuccess(response) {
            currentUser.Department = response.data.d.UserProfileProperties.results.find(function getDept(prop) {
                return prop.Key == "Department";
            }).Value;
            currentUser.Company = response.data.d.UserProfileProperties.results.find(function getCom(prop) {
                return prop.Key == "Company";
            }).Value;
            if (currentUser.Department == "IT") {
                $scope.notAdmin = false;
            }
            loadFormData();
        });
    };

    function loadFormData() {
        SPHelper.loadFromSpFields(SPFieldsConfig, $, $scope);
        if (isNew) {
            if ($scope.notAdmin) {
                if (currentUser.Company == "ALI") {
                    currentUser.Company = "DPC";
                }
                $scope.BG = currentUser.Department;
                $scope.Company = currentUser.Company;
                $scope.loadOption();
            } else {
                msg.text("Hi admin, please input BG and Company");
                $scope.Company = "DPC";
            }
            loadFromUrl();
            $scope.Year = "2016";
            $scope.Month = "01";
            $scope.YearMonthChanged();
            httpget(queryNextBatchNum, function mySuccess(response) {
                $scope.BatchNumber = response.data.d.getNextAdjustBatchNum;
            });
        } else {
            $scope.loadOption();
            $scope.Month = $scope.YearMonth.substring(4, 6);
            if ($scope.ApprovalStatus == "Approved" || $scope.ApprovalStatus == "Pending") {
                msg.text("The status is " + $scope.ApprovalStatus + ", can't be edited.");
                if ($scope.notAdmin) {
                    $("#btSave").prop("disabled", true);
                }
            }
        }
    };

    $scope.YearMonthChanged = function() {
        if ($scope.Year && $scope.Month) {
            $scope.YearMonth = $scope.Year + $scope.Month;
        }
    };

    function setList(type, list) {
        $scope[type + "s"] = list;
    };

    $scope.inputChanged = function(type) {
        var value = $scope["input" + type];
        if (!value) {
            return;
        }
        if (value.length >= 1) {
            var field = type;
            if (field.startsWith("New")) {
                field = field.substring(3, field.length);
            }
            var filter = "indexof(" + field + ", '" + value + "') ge 0";
            searchOption(filter, type);
        } else if (value.length < 1) {
            setList(type, []);
        };
    };

    function searchOption(filter, type) {
        if (filter != '') {
            filter = " and " + filter;
        }
        var view = type;
        if (view.startsWith("New")) {
            view = view.substring(3, view.length);
        }
        var url = dataService + "v" + view + "4Adjustment?$select=value&$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'" + filter;
        //console.log(urlStr);
        httpget(url, function mySuccess(response) {
            setList(type, response.data.d);
        });
    };

    //if pre load, then use loadOptionByType,
    function loadOptionByType(type) {
        var view = type;
        if (view.startsWith("New")) {
            view = view.substring(3, view.length);
        }
        var url = dataService + "v" + view + "4Adjustment?$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'";
        httpget(url, function mySucces(response) {
            setList(type, response.data.d);
        });
    };

    $scope.loadOption = function() {
        if (!$scope.BG || !$scope.Company) {
            return;
        }
        var url = profileListUrl + "?$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'&$orderby=DomainAccount&$top=999";
        httpget(url, function mySuccess(response) {
            $scope.SalesPersons = response.data.d;
        });
        //if pre load, then use loadOptionByType
        //loadOptionByType("EndCustomer");
        //loadOptionByType("Material");
        //loadOptionByType("ProfitCenter");
    };

    function loadFromUrl() {
        var sales = myUtility.getParam("s");
        var customer = myUtility.getParam("c");
        if (!sales || !customer) {
            return;
        }
        var url = vSalesCustomerUrl + "?$filter=SalesPerson eq '" + sales + "' and EndCustomer eq '" + customer + "'";
        if ($scope.notAdmin) {
            url = url + " and BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'"
        }
        httpget(url, function mySuccess(response) {
            console.log(response.data.d);
            var d = response.data.d[0];
            $scope.BG = d.BG;
            $scope.Company = d.Company;
            $scope.loadOption();
            $scope.SalesPerson = d.SalesPerson;
            $scope.EndCustomer = [d.EndCustomer];
        }, function myError() {
            console.log("url not match");
        });
    };

    function checkStatus() {
        if ($scope.ApprovalStatus == "Approved" || $scope.ApprovalStatus == "Pending") {
            if ($scope.notAdmin) {
                $("#btSave").prop("disabled", true);
                msg.text("The status is " + $scope.ApprovalStatus + ", can't be edited.");
                alert(msg.text());
            } else {
                if (prompt("The status is " + $scope.ApprovalStatus + ", continue save?") != null) {
                    return true;
                }
            }
            return false;
        }
        return true;
    };

    function checkCondition() {
        if (!$scope.SalesPerson && !$scope.EndCustomer && !$scope.Material) {
            msg.text("Sales Person and End Customer and Material can't be empty at the same time");
            alert(msg.text());
            return false;
        }
        return true;
    };

    function checkValue() {
        if (!$scope.NewSalesPerson && !$scope.NewEndCustomer && !$scope.NewMaterial) {
            msg.text("New Sales Person and New End Customer and New Material can't be empty at the same time");
            alert(msg.text());
            return false;
        }
        if ($scope.NewEndCustomer && ($scope.EndCustomer.toUpperCase() != "OTHERS" || $scope.EndCustomer.toUpperCase() != "DISTRIBUTOR OTHERS")) {
            msg.text("Only allow to change End Customer when End Customer is OTHERS");
            alert(msg.text());
            return false;
        }
        return true;
    }

    PreSaveAction = function() {
        SPHelper.saveToSpFields($scope);
        if (!checkStatus()) {
            return false;
        }
        if (!checkCondition()) {
            return false;
        }
        if (!checkValue()) {
            return false;
        }
        return true;
    };

    $scope.searchActualBudget = function() {
        msg.text("");
        $scope.ActualBudget = null;
        if (checkCondition() == false) {
            return;
        }
        $scope.status = "loading";
        var condition = "Year='" + $scope.Year + "'&BG='" + $scope.BG + "'&Company='" + $scope.Company + "'";
        if ($scope.SalesPerson != "") {
            condition += "&SalesPerson='" + $scope.SalesPerson + "'";
        }
        if ($scope.EndCustomer != "") {
            condition += "&EndCustomer='" + $scope.EndCustomer + "'";
        }
        if ($scope.Material != "") {
            condition += "&Material='" + $scope.Material + "'";
        }
        if ($scope.ProfitCenter != "") {
            condition += "&ProfitCenter='" + $scope.ProfitCenter + "'";
        }
        $scope.status = "loading:" + condition;
        console.log(queryActualBudgetUrl + "?" + condition);
        httpget(queryActualBudgetUrl + "?" + condition, function mySuccess(response) {
            $scope.ActualBudget = response.data.d;
            var myDate = new Date();
            $scope.status = "loaded at " + myDate.toLocaleTimeString();
        }, function myError(response) {
            $scope.status = "error:" + condition;
            alert("error");
        });
    };

    $scope.onSearchChange = function(event) {
        event.stopPropagation();
    };

    $scope.SalesTypes = ['T', 'D'];

    $("#btSave").click(function() {
        $("[value='Save']:first").click();
    });
    $("#btCancel").click(function() {
        $("[value='Cancel']:first").click();
    });

    function httpget(url, success, error = myError) {
        $http({
            method: "GET",
            url: url,
            headers: headers
        }).then(success, error);
    };

    function myError(response) {
        msg.text(response.status);
    }
});
