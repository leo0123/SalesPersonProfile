var angular = require("angular");
var $ = require("jquery");
require("angular-material");
var myUtility = require("./Utility.js");

var myFormUrl = myAdjustmentConfig.myFormUrl;
var listServer = myAdjustmentConfig.listServer;
var dataService = myAdjustmentConfig.dataService;
var vSalesCustomerUrl = dataService + "vSalesCustomer";
var currentUserUrl = listServer + "_api/SP.UserProfiles.PeopleManager/GetMyProperties";
//var profileListUrl = listServer + "_api/web/lists/getbytitle('Sales Person Profile')/items";
var profileListUrl = dataService + "vSalesPersonProfile";
var queryActualBudgetUrl = dataService + "getActualBudget";
var queryNextBatchNum = dataService + "getNextAdjustBatchNum";
var headers = {
    "accept": "application/json;odata=verbose"
};

var myApp = angular.module('myApp', ['ngMaterial']);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormReady = function() {

    };
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myCtrl", function($scope, $http) {
    $scope.notAdmin = true;

    var spFields = {};
    spFields.BG = $("[title='BG Required Field']");
    spFields.Company = $("[title='Company Required Field']");
    spFields.SalesPerson = $("[title='Sales Person']");
    spFields.EndCustomer = $("[title='End Customer']");
    spFields.Material = $("[title='Material']");
    spFields.ProfitCenter = $("[title='Profit Center']");
    spFields.Year = $("[title='Year']");
    spFields.NewSalesPerson = $("[title='New Sales Person']");
    spFields.NewEndCustomer = $("[title='New End Customer']");
    spFields.NewMaterial = $("[title='New Material']");
    spFields.SoldToCode = $("[title='Sold To Code']");
    spFields.BatchNumber = $("[title='Batch Number']");
    spFields.SalesType = $("[title='Sales Type']");
    spFields.YearMonth = $("[title='Effective Year Month Required Field']");
    spFields.ApprovalStatus = $("[title='Approval Status']");
    const isNew = $("#myFormType").text() == "new" ? true : false;

    $("#btSave").click(function() {
        $("[value='Save']:first").click();
    });
    $("#btCancel").click(function() {
        $("[value='Cancel']:first").click();
    });

    var msg = $("#msg");
    var dept;
    var com;
    getCurrentUserInfo();

    function getCurrentUserInfo() {
        $http({
            method: "GET",
            url: currentUserUrl,
            headers: headers
        }).then(function mySuccess(response) {
            dept = response.data.d.UserProfileProperties.results.find(getDept).Value;
            com = response.data.d.UserProfileProperties.results.find(getCom).Value;
            if (dept == "IT") {
                $scope.notAdmin = false;
            }
            loadFormData();
        }, function myError(response) {
            msg.text(response.status);
        });
    };

    function loadFormData() {
        if (isNew) {
            if ($scope.notAdmin) {
                if (com == "ALI") {
                    com = "DPC";
                }
                setBG(dept);
                setCompany(com);
            } else {
                msg.text("Hi admin, please input BG and Company");
                setCompany("DPC");
            }
            loadFromUrl();
            $scope.selectedYear = "2016";
            spFields.Year.val("2016");
            $scope.selectedMonth = "01";
            spFields.YearMonth.val("201601");
            $http({
                method: "GET",
                url: queryNextBatchNum,
                headers: headers
            }).then(function mySuccess(response) {
                setBatchNumber(response.data.d.getNextAdjustBatchNum);
            }, function myError(response) {
                msg.text(response.status);
            });
        } else {
            setBG(spFields.BG.val());
            setCompany(spFields.Company.val());
            $scope.selectedSalesPerson = spFields.SalesPerson.val();
            $scope.selectedEndCustomer = spFields.EndCustomer.val();
            $scope.selectedMaterial = spFields.Material.val();
            $scope.selectedProfitCenter = spFields.ProfitCenter.val();
            $scope.selectedYear = spFields.Year.val();
            $scope.selectedNewSalesPerson = spFields.NewSalesPerson.val();
            $scope.selectedNewEndCustomer = spFields.NewEndCustomer.val();
            $scope.selectedNewMaterial = spFields.NewMaterial.val();
            $scope.selectedSoldToCode = spFields.SoldToCode.val();
            $scope.BatchNumber = spFields.BatchNumber.val();
            $scope.selectedSalesType = spFields.SalesType.val();
            $scope.selectedMonth = spFields.YearMonth.val().substring(4, 6);
            if (spFields.ApprovalStatus.val() == "Approved" || spFields.ApprovalStatus.val() == "Pending") {
                msg.text("The status is " + spFields.ApprovalStatus.val() + ", can't be edited.");
                if ($scope.notAdmin) {
                    $("#btSave").prop("disabled", true);
                }
            }
        }
    };

    function setBatchNumber(value) {
        spFields.BatchNumber.val(value);
        $scope.BatchNumber = value;
    };

    function setBG(value) {
        spFields.BG.val(value);
        $scope.BG = value;
        loadOption();
    };

    function setCompany(value) {
        spFields.Company.val(value);
        $scope.Company = value;
        loadOption();
    };

    $scope.selectedChanged = function(field) {
        if (field == "SalesPerson") {
            spFields.SalesPerson.val($scope.selectedSalesPerson);
        } else if (field == "EndCustomer") {
            spFields.EndCustomer.val($scope.selectedEndCustomer);
        } else if (field == "Material") {
            spFields.Material.val($scope.selectedMaterial);
        } else if (field == "ProfitCenter") {
            spFields.ProfitCenter.val($scope.selectedProfitCenter);
        } else if (field == "NewSalesPerson") {
            spFields.NewSalesPerson.val($scope.selectedNewSalesPerson);
        } else if (field == "NewEndCustomer") {
            spFields.NewEndCustomer.val($scope.selectedNewEndCustomer);
        } else if (field == "NewMaterial") {
            spFields.NewMaterial.val($scope.selectedNewMaterial);
        } else if (field == "SoldToCode") {
            spFields.SoldToCode.val($scope.selectedSoldToCode);
        } else if (field == "SalesType") {
            spFields.SalesType.val($scope.selectedSalesType);
        } else if (field == "Year") {
            spFields.Year.val($scope.selectedYear);
            spFields.YearMonth.val(spFields.Year.val() + $scope.selectedMonth);
        } else if (field == "YearMonth") {
            spFields.YearMonth.val(spFields.Year.val() + $scope.selectedMonth);
        }
    };

    function setList(type, list) {
        if (type == "EndCustomer") {
            $scope.EndCustomers = list;
        } else if (type == "Material") {
            $scope.Materials = list;
        } else if (type == "ProfitCenter") {
            $scope.ProfitCenters = list;
        } else if (type == "NewEndCustomer") {
            $scope.NewEndCustomers = list;
        } else if (type == "NewMaterial") {
            $scope.NewMaterials = list;
        } else if (type == "SoldToCode") {
            $scope.SoldToCodes = list;
        }
    };

    $scope.inputChanged = function(value, type) {
        if (!value) {
            return;
        }
        if (type == "BG") {
            setBG(value);
            return;
        }
        if (type == "Company") {
            setCompany(value);
            return;
        }
        if (type == "BatchNumber") {
            setBatchNumber(value);
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

    $scope.onSearchChange = function(event) {
        event.stopPropagation();
    };

    function searchOption(filter, type) {
        if (filter != '') {
            filter = " and " + filter;
        }
        var view = type;
        if (view.startsWith("New")) {
            view = view.substring(3, view.length);
        }
        var urlStr = dataService + "v" + view + "4Adjustment?$filter=BG eq '" + spFields.BG.val() + "' and Company eq '" + spFields.Company.val() + "'" + filter;
        //console.log(urlStr);
        $http({
            method: "GET",
            url: urlStr,
            headers: headers
        }).then(function mySucces(response) {
            setList(type, response.data.d);
        }, function myError(response) {
            msg.text(response.status);
        })
    };

    //if pre load, then use loadOptionByType,
    function loadOptionByType(type) {
        var view = type;
        if (view.startsWith("New")) {
            view = view.substring(3, view.length);
        }
        var urlStr = dataService + "v" + view + "4Adjustment?$filter=BG eq '" + spFields.BG.val() + "' and Company eq '" + spFields.Company.val() + "'";
        $http({
            method: "GET",
            url: urlStr,
            headers: headers
        }).then(function mySucces(response) {
            setList(type, response.data.d);
        }, function myError(response) {
            msg.text(response.status);
        })
    };

    function getDept(prop) {
        return prop.Key == "Department";
    };

    function getCom(prop) {
        return prop.Key == "Company";
    };

    function loadOption() {
        if (!(spFields.BG.val() && spFields.Company.val())) {
            return;
        }
        var url = profileListUrl + "?$top=999&$orderby=DomainAccount&$filter=BG eq '" + spFields.BG.val() + "' and Company eq '" + spFields.Company.val() + "'";
        $http({
            method: "GET",
            url: url,
            headers: headers
        }).then(function mySucces(response) {
            $scope.SalesPersons = response.data.d;
            var s = $scope.selectedSalesPerson;
            $scope.selectedSalesPerson = null;
            $scope.selectedSalesPerson = s;
            //inputParams();
        }, function myError(response) {
            msg.text(response.status + url);
        });
        //if pre load, then use loadOptionByType
        //loadOptionByType("EndCustomer");
        //loadOptionByType("Material");
        //loadOptionByType("ProfitCenter");
    };

    function loadData(url, mySuccess, myError) {
        $http({
            method: "GET",
            url: url,
            headers: headers
        }).then(mySuccess, myError);
    };

    function loadFromUrl() {
        var sales = myUtility.getParam("s");
        var customer = myUtility.getParam("c");
        var url = vSalesCustomerUrl + "?$filter=SalesPerson eq '" + sales + "' and EndCustomer eq '" + customer + "'";
        if ($scope.notAdmin) {
            url = url + " and BG eq '" + $scope.BG + "' and Company eq '" + $scope.Company + "'"
        }
        loadData(url, function mySuccess(response) {
            console.log(response.data.d);
            var d = response.data.d[0];
            setCompany(d.Company);
            setBG(d.BG);
            $scope.selectedSalesPerson = d.SalesPerson;
            $scope.selectedEndCustomer = [d.EndCustomer];
        }, function myError() {
            console.log("url not match");
        });
    };

    function checkStatus() {
        if (spFields.ApprovalStatus.val() == "Approved" || spFields.ApprovalStatus.val() == "Pending") {
            if ($scope.notAdmin) {
                $("#btSave").prop("disabled", true);
                msg.text("The status is " + spFields.ApprovalStatus.val() + ", can't be edited.");
                alert(msg.text());
            } else {
                if (prompt("The status is " + spFields.ApprovalStatus.val() + ", continue save?") != null) {
                    return true;
                }
            }
            return false;
        }
        return true;
    };

    function checkCondition() {
        if (spFields.SalesPerson.val() == "" && spFields.EndCustomer.val() == "" && spFields.Material.val() == "") {
            msg.text("Sales Person and End Customer and Material can't be empty at the same time");
            alert(msg.text());
            return false;
        }
        return true;
    };

    function checkValue() {
        if (spFields.NewSalesPerson.val() == "" && spFields.NewEndCustomer.val() == "" && spFields.NewMaterial.val() == "") {
            msg.text("New Sales Person and New End Customer and New Material can't be empty at the same time");
            alert(msg.text());
            return false;
        }
        if (spFields.NewEndCustomer.val() != "" && (spFields.EndCustomer.val().toUpperCase() != "OTHERS" || spFields.EndCustomer.val().toUpperCase() != "DISTRIBUTOR OTHERS")) {
            msg.text("Only allow to change End Customer when End Customer is OTHERS");
            alert(msg.text());
            return false;
        }
        return true;
    }

    PreSaveAction = function() {
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
        var condition = "Year='" + spFields.Year.val() + "'&BG='" + spFields.BG.val() + "'&Company='" + spFields.Company.val() + "'";
        if (spFields.SalesPerson.val() != "") {
            condition += "&SalesPerson='" + spFields.SalesPerson.val() + "'";
        }
        if (spFields.EndCustomer.val() != "") {
            condition += "&EndCustomer='" + spFields.EndCustomer.val() + "'";
        }
        if (spFields.Material.val() != "") {
            condition += "&Material='" + spFields.Material.val() + "'";
        }
        if (spFields.ProfitCenter.val() != "") {
            condition += "&ProfitCenter='" + spFields.ProfitCenter.val() + "'";
        }
        $scope.status = "loading:" + condition;
        console.log(queryActualBudgetUrl + "?" + condition);
        $http({
            method: "GET",
            url: queryActualBudgetUrl + "?" + condition,
            headers: headers
        }).then(function mySucces(response) {
            $scope.ActualBudget = response.data.d;
            var myDate = new Date();
            $scope.status = "loaded at " + myDate.toLocaleTimeString();
        }, function myError(response) {
            $scope.status = "error:" + condition;
            alert("error");
        });
    };

    $scope.SalesTypes = ['T', 'D'];
});
