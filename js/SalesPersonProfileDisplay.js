var angular = require("angular");
var $ = require("jquery");

var myFormUrl = mySalesPersonProfileConfig.myDisplaySectionUrl;
var dataServiceUrl = mySalesPersonProfileConfig.dataServiceUrl;
var adjustUrl = mySalesPersonProfileConfig.SPListServer + "Lists/Adjustment%20Record/NewForm.aspx";
var headers = {
    "accept": "application/json;odata=verbose"
};

$(function() {
    getTr("JSONStr").hide();
    //getTr("Department").hide();
});

function getTr(FieldName) {
    return $("[Name='SPBookmark_" + FieldName + "']").parentsUntil("tr").parent();
};

function getFeildValue(FieldName) {
    return getTr(FieldName).children("#SPFieldText").text();
};

var myApp = angular.module("myApp", []);
myApp.controller("myPreCtrl", function($scope) {
    $scope.myFormUrl = myFormUrl;
});
myApp.controller("myCtrl", function($scope, $http) {
    $scope.btName = "load customers";
    $scope.showSalesCustomer = function() {
        if ($scope.btName == "load customers") {
            var NTAccount = getFeildValue("DomainAccount");
            //var BG = getFeildValue("BG");
            //var Company = getFeildValue("Company");
            $scope.adjustUrl = adjustUrl;
            $scope.params = "&s=" + NTAccount;// + "&BG=" + BG + "&Company=" + Company;
            $scope.status = "loading";
            $scope.showResults = true;
            $scope.btName = "hide";
            $http({
                method: "GET",
                url: dataServiceUrl + "vSalesCustomer?$filter=SalesPerson eq '" + NTAccount + "'&$orderby=EndCustomer",
                headers: headers
            }).then(function mySucces(response) {
                $scope.Customers = response.data.d;
                var myDate = new Date();
                $scope.status = "loaded at " + myDate.toLocaleTimeString();
            }, function myError(response) {
                $scope.status = response.status;
            })
        } else {
            $scope.showResults = !$scope.showResults;
            $scope.btName = !$scope.showResults ? "show customers" : "hide";
        }
    };
});
