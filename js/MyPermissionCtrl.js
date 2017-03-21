var myPermissionModel = require("./ParseSql.js");
var CustomizeExpressionManager = require("./CustomizeExpressionManager.js");
var Expression = require("./Expression.js");
var myPermissionModel = require("./MyModel.js");
var $ = require("jquery");
var ParseSqlHelper = require("./ParseSql.js");

//var myPermissionApp = myPermissionApp || {};
var myPermissionHelper = mySalesPersonProfileConfig.myPermissionHelper;
var serviceUrl = mySalesPersonProfileConfig.dataService;

//myPermissionApp.
myPermissionCtrl = function($scope, $http, $location) {
    //var log = myPermissionApp.log;
    var expM = new CustomizeExpressionManager();
    var currentExp;
    var currentGroup;
    var dialogStatus = 'status';
    var spPermission = $("[title='Permission']");
    var spJSONStr = $("[title='JSONStr']");
    var spDepartment = $("[title='Department']");
    //var theBG = spDepartment.val();
    //var serviceUrl = myPermissionModel.UrlList.serviceUrl;
    $scope.expRoot = expM.getRoot();
    $scope.OptionManager = new myPermissionModel.OptionManager();

    myPermissionHelper.load = function(BG, Permission, JSONStr){
        load(BG, Permission, JSONStr);
    };
    function load(BG, Permission, JSONStr) {
        //theBG = spDepartment.val();
        if (!BG) {
            $("#msg").text("Department can't be empty");
            alert("Department can't be empty");
            return;
        }
        //$("#permissionEditor").show();

        if (JSONStr) {
            setRoot(angular.fromJson(JSONStr));
        } else if (Permission) {
            try {
                var helper = new ParseSqlHelper();
                var exp = helper.ParseSql(Permission);
                if (exp != null) {
                    var r = new Expression();
                    r.IsGroup = true;
                    r.Children.push(exp);
                    var o = angular.fromJson(angular.toJson(r));
                    setRoot(o);
                } else {
                    $scope.msg = "can't parse original permission, please contact IT or create new permission";
                }
            } catch (e) {
                $scope.msg = "can't parse original permission, please contact IT or create new permission";
            }
        } else {
            $scope.expRoot = expM.getNewRoot();
        }
        //$scope.$apply();
    };
    function openPermissionEditor() {
        //theBG = spDepartment.val();
        if (!spDepartment.val()) {
            $("#msg").text("Department can't be empty");
            alert("Department can't be empty");
            return;
        }
        $("#permissionEditor").show();

        if (spJSONStr.val()) {
            setRoot(angular.fromJson(spJSONStr.val()));
        } else if (spPermission.val()) {
            try {
                var helper = new ParseSqlHelper();
                var exp = helper.ParseSql(spPermission.val());
                if (exp != null) {
                    var r = new Expression();
                    r.IsGroup = true;
                    r.Children.push(exp);
                    var o = angular.fromJson(angular.toJson(r));
                    setRoot(o);
                } else {
                    $scope.msg = "can't parse original permission, please contact IT or create new permission";
                }
            } catch (e) {
                $scope.msg = "can't parse original permission, please contact IT or create new permission";
            }
        } else {
            $scope.expRoot = expM.getNewRoot();
        }
        $scope.$apply();
    };
    //$("#btOpenPermissionEditor").click(openPermissionEditor);

    $scope.resetExpRoot = function() {
        $scope.expRoot = expM.getNewRoot();
    };

    $scope.btPermissionOKClick = function() {
        //spJSONStr.val(angular.toJson(expM.getRoot()));
        //spPermission.val(expM.getRoot().ToString());
        myPermissionHelper.save(expM.getRoot().ToString(), angular.toJson(expM.getRoot()));
        //$("#permissionEditor").hide();
        //$scope.$parent.$parent.showPermission = false;
        myPermissionHelper.close();
    };
    $scope.btPermissionCancelClick = function() {
        //$("#permissionEditor").hide();
        //$scope.$parent.$parent.showPermission = false;
        myPermissionHelper.close();
    };

    function setRoot(jsonObject) {
        expM.setRoot(jsonObject);
        $scope.expRoot = expM.getRoot();
        //$scope.$apply();
    };

    $scope.delayLoadOption = function(type) {
        $scope.OptionManager.init(spDepartment.val(), $http, $scope, "Options");
        $scope.OptionManager.tryToGetOption(type, false, "");
    };

    $scope.inputChanged = function(type) {
        if ($scope["input" + type].length == 2) {
            $scope.OptionManager.tryToGetOption(type, false, $scope["input" + type]);
        }
    };

    $scope.selectedChanged = function(field) {
        var list = null;
        if (field == $scope.OptionManager.TypeList.BG) {
            list = $scope.selectedBG;
        } else if (field == $scope.OptionManager.TypeList.ProfitCenter) {
            list = $scope.selectedProfitCenter;
        } else if (field == $scope.OptionManager.TypeList.DomainAccount) {
            list = $scope.selectedDomainAccount;
        } else if (field == $scope.OptionManager.TypeList.EndCustomer) {
            list = $scope.selectedEndCustomer;
        } else if (field == $scope.OptionManager.TypeList.SoldToCustomer) {
            list = $scope.selectedSoldToCustomer;
        } else if (field == $scope.OptionManager.TypeList.Office) {
            list = $scope.selectedOffice;
        } else if (field == $scope.OptionManager.TypeList.SalesOffice) {
            list = $scope.selectedSalesOffice;
        } else if (field == $scope.OptionManager.TypeList.SalesType) {
            list = $scope.selectedSalesType;
        }

        expM.clearGroup(field);
        for (var i = 0; i < list.length; i++) {
            var value = "'" + list[i] + "'";
            expM.addInGroup(field, value, "=");
        }
    };

    $scope.addInGroup = function(group) {
        currentGroup = group;
        dialogStatus = "addInGroup";
        showPanel();
    };
    $scope.addGroup = function(group) {
        currentGroup = group;
        dialogStatus = "addGroup";
        showPanel();
    };
    $scope.changeGroupLogic = function(exp) {
        exp.changeGroupLogic();
    };

    $scope.openSingleEditor = function(exp) {
        currentExp = exp;
        exp.Field = $scope.OptionManager.getStandardField(exp.Field);

        $scope.singleField = exp.Field;
        $scope.singleValue = exp.Value.replace(/'/g, "");
        $scope.singleOperation = exp.Operation.replace(/ /g, "");

        dialogStatus = "edit";
        if (exp.Field == $scope.OptionManager.TypeList.EndCustomer ||
            exp.Field == $scope.OptionManager.TypeList.SoldToCustomer) {
            $scope.inputCommon = $scope.singleValue
        }
        showPanel();
    };

    $scope.selectedSingleFieldChanged = function(field) {
        $scope.singleValue = "";
        searchCommon();
    };

    function showPanel() {
        $("#setFieldValueContainer").show();
        $scope.singleOperation = $scope.singleOperation ? $scope.singleOperation : "=";
        searchCommon();
        //$scope.$apply();
    };

    $scope.inputCommonChanged = function() {
        searchCommon();
    };

    function searchCommon() {
        if ($scope.singleField) {
            if (!$scope.OptionManager.isSalesP($scope.singleField)) {
                var type = $scope.OptionManager.getType($scope.singleField);
                $scope.OptionManager.tryToGetOption(type, true, "");
            } else {
                $scope.OptionManager.tryToGetOption($scope.OptionManager.TypeList.DomainAccount, true, "", optionLoaded);
            }
        }
    };

    function optionLoaded() {
        if ($scope.OptionManager.isSalesP($scope.singleField)) {
            $scope.singleField = $scope.OptionManager.TypeList.DomainAccount;
            $scope.singleValue = $scope.commonList.find(function(item) {
                return item.SalesP.toLowerCase() == $scope.singleValue.toLowerCase();
            }).Value;
        }
    };

    $scope.btSetFieldValueOKClick = function() {
        if (!($scope.singleField && $scope.singleOperation && $scope.singleValue)) {
            return;
        }
        var value = "'" + $scope.singleValue + "'";
        var operation = $scope.singleOperation;
        if (operation == "like") {
            operation = " " + operation + " ";
            //value = "'" + $scope.singleValue + "'";
        }
        if (dialogStatus == "addInGroup") {
            expM.add(currentGroup, $scope.singleField, value, operation);
        } else if (dialogStatus == "edit") {
            currentExp.setFieldValue($scope.singleField, value, operation);
        } else if (dialogStatus == "addGroup") {
            expM.addGroup(currentGroup, $scope.singleField, value, operation);
            $scope.expRoot = expM.getRoot();
        }
        $("#setFieldValueContainer").hide();
        $scope.inputCommon = "";
    };
    $scope.btSetFieldValueCancelClick = function() {
        $("#setFieldValueContainer").hide();
        $scope.inputCommon = "";
    };

    $scope.previousTab = function() {
        if ($scope.selectedTabIndex > 0) {
            $scope.selectedTabIndex = $scope.selectedTabIndex - 1;
        }
    };
    $scope.nextTab = function() {
        if ($scope.selectedTabIndex < 7) {
            $scope.selectedTabIndex = $scope.selectedTabIndex + 1;
        }
    };

    $scope.openMenu = function($mdOpenMenu, $event) {
        $mdOpenMenu($event);
    };

    $scope.onSearchChange = function(event) {
        event.stopPropagation();
    };
};

module.exports = myPermissionCtrl;//myPermissionApp;
