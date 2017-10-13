var angular = require("angular");
var $ = require("jquery");

var myFormUrl = mySalesPersonProfileConfig.myDisplaySectionUrl;
var dataServiceUrl = mySalesPersonProfileConfig.dataServiceUrl;
var adjustUrl = mySalesPersonProfileConfig.SPServerUrl + "Lists/AdjustmentRecord/NewForm.aspx";
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
    $scope.selectedCustomers = [];
    $scope.showSalesCustomer = function() {
        if ($scope.btName == "load customers") {
            var NTAccount = getFeildValue("DomainAccount");
            //var BG = getFeildValue("BG");
            //var Company = getFeildValue("Company");
            $scope.adjustUrl = adjustUrl;
            $scope.params = "s=" + NTAccount.trim();// + "&BG=" + BG + "&Company=" + Company;
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
    $scope.toggleSelectCustomer = function(e) {
      /*var i = $scope.selectedCustomers.indexOf(EndCustomer);
      if (i>-1) {
        $scope.selectedCustomers.splice(i, 1);
      } else {
        $scope.selectedCustomers.push(EndCustomer);
      }*/
      if (e.selected) {
        e.selected = false;
      } else {
        e.selected = true;
      }
      $scope.allCustomerSelected = $scope.filteredCustomers.every(function(e) {
        return e.selected;
      });
      var i = $scope.filteredCustomers.findIndex(function(e) {
        return e.selected;
      });
      if (i>=0) {
        $scope.anyCustomerSelected = true;
      } else {
        $scope.anyCustomerSelected = false;
      }
    }
    $scope.adjustSelected = function() {
      var list = [];
      $scope.filteredCustomers.forEach(function(e) {
        if (e.selected) {
          list.push(e.EndCustomer);
        }
      });
      sessionStorage.setItem('selectedEndCustomers',JSON.stringify(list));
      var url = adjustUrl + "?" + $scope.params + "&c=" + list.toString();
      if (url.length>2083) {
        alert("too many customer");
      } else {
        window.open(url);
      }
    }
    $scope.filterYear = function() {
      $scope.filterCondition = {
        Year: $scope.yearFilter
      }
    }
    $scope.toggleSelectAllCustomer = function() {
      if ($scope.allCustomerSelected) {
        $scope.allCustomerSelected = false;
        $scope.anyCustomerSelected = false;
      } else {
        $scope.allCustomerSelected = true;
        $scope.anyCustomerSelected = true;
        /*$scope.selectedCustomers.splice(0);
        for (var i=0; i<$scope.filteredCustomers.length; i++) {
          $scope.selectedCustomers.push($scope.filteredCustomers[i]);
        }*/
      }
      $scope.filteredCustomers.forEach(function(e) {
        e.selected = $scope.allCustomerSelected;
      })
    }
});
