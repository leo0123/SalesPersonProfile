var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myUtility = require("./Utility.js");
var AdjustmentFieldsConfig = require("./AdjustmentFields.js");

var myFormUrl = myAdjustmentConfig.myFormUrl;
var SPServerUrl = myAdjustmentConfig.SPServerUrl;
var dataServiceUrl = myAdjustmentConfig.dataServiceUrl;
var vSalesCustomerUrl = dataServiceUrl + "vSalesCustomer";
var currentUserUrl = SPServerUrl + "_api/SP.UserProfiles.PeopleManager/GetMyProperties";
var profileListUrl = dataServiceUrl + "vSalesPersonProfile";
var queryActualBudgetUrl = dataServiceUrl + "getActualBudget";
var queryNextBatchNumUrl = dataServiceUrl + "getNextAdjustBatchNum";
var AdjustmentListUrl = myAdjustmentConfig.AdjustmentListUrl;
var listName = "AdjustmentRecord";

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myCtrl", function($scope, $http) {
    $scope.notAdmin = true;
    $scope.isNew = $("#myFormType").text() == "new" ? true : false;
    var msg = $("#msg");
    var currentUser = {};
    var HttpGet = myUtility.buildHttpGet($http, myError);
    var SPHelper = myUtility.buildSPHelper({
        $scope: $scope,
        fieldsConfig: AdjustmentFieldsConfig,
        SPList: AdjustmentListUrl,
        SPServer: SPServerUrl,
        $http: $http,
    });

    getCurrentUserInfo();

    function getCurrentUserInfo() {
        HttpGet(currentUserUrl, function(result) {
            currentUser.Department = result.d.UserProfileProperties.results.find(function getDept(prop) {
                return prop.Key == "Department";
            }).Value;
            currentUser.Company = result.d.UserProfileProperties.results.find(function getCom(prop) {
                return prop.Key == "Company";
            }).Value;
            if (currentUser.Department == "IT") {
                $scope.notAdmin = false;
            }
            loadFormData();
        });
    };

    function loadFormData() {
        if ($scope.isNew) {
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
            HttpGet(queryNextBatchNumUrl, function(result) {
                $scope.BatchNumber = result.d.getNextAdjustBatchNum;
            });
        } else {
            SPHelper.loadFromSP(function() {
                $scope.loadOption();
                $scope.Year = $scope.EffectiveYearMonth.substring(0, 4);
                $scope.Month = $scope.EffectiveYearMonth.substring(4, 6);
                if ($scope.ApprovalStatus == "Approved" || $scope.ApprovalStatus == "Pending") {
                    msg.text("The status is " + $scope.ApprovalStatus + ", can't be edited.");
                    if ($scope.notAdmin) {
                        $("#btSave").prop("disabled", true);
                    }
                }
            }, myError);
        }
    };

    $scope.YearMonthChanged = function() {
        if ($scope.Year && $scope.Month) {
            $scope.EffectiveYearMonth = $scope.Year + $scope.Month;
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
        var url = dataServiceUrl + "v" + view + "4Adjustment?$select=value&$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'" + filter;
        HttpGet(url, function mySuccess(result) {
            setList(type, result.d);
        });
    };

    //if pre load, then use loadOptionByType,
    function loadOptionByType(type) {
        var view = type;
        if (view.startsWith("New")) {
            view = view.substring(3, view.length);
        }
        var url = dataServiceUrl + "v" + view + "4Adjustment?$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'";
        HttpGet(url, function mySucces(result) {
            setList(type, result.d);
        });
    };

    $scope.loadOption = function() {
        if (!$scope.BG || !$scope.Company) {
            return;
        }
        var url = profileListUrl + "?$filter=BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'&$orderby=DomainAccount&$top=999";
        HttpGet(url, function mySuccess(result) {
            $scope.SalesPersons = result.d;
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
        HttpGet(url, function mySuccess(result) {
            var d = result.d[0];
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
        if ($scope.NewEndCustomer) {
            for (var i in $scope.EndCustomer) {
                if ($scope.EndCustomer[i].toUpperCase() != "OTHERS" &&
                    $scope.EndCustomer[i].toUpperCase() != "DISTRIBUTOR OTHERS" &&
                    $scope.EndCustomer[i].toUpperCase() != "UNKNOWN") {
                    msg.text("Only allow to change End Customer when End Customer is OTHERS or UNKNOWN");
                    alert(msg.text());
                    return false;
                }
            }
        }
        return true;
    }

    function checkAndSaveToSP() {
        if (!checkStatus()) {
            return;
        }
        if (!checkCondition()) {
            return;
        }
        if (!checkValue()) {
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
        checkAndSaveToSP();
        return false;
    };

    $("#btSave").click(function() {
        //$("[value='Save']:first").click();
        checkAndSaveToSP();
    });
    $("#btCancel").click(function() {
        //$("[value='Cancel']:first").click();
        backToSPListPage();
    });

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
        HttpGet(queryActualBudgetUrl + "?" + condition, function mySuccess(result) {
            $scope.ActualBudget = result.d;
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

    function myError(response) {
        msg.text(response.status);
    }
});
