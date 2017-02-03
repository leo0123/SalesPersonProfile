var app = angular.module("myApp", []);
app.controller("myCtrl", function ($scope,$http) {
	$("#btAngularClose").click(function(){
									$("#AngularDiv").hide();
								});
	$scope.status="loading";
	var NTAccount = $("#DomainAccount").text();
	//var account = NTAccount.substring(13);
	var BG = $("#Department").text();
	var Company = $("#Company").text();
	$scope.params = "&BG="+BG+"&Company="+Company+"&Account="+NTAccount;
	//alert(account);
	$http({
            method: "GET",
            url: "http://amdpfweb02:8080/SAPBW3DataService.svc/vSalesCustomer?$filter=SalesPerson eq '"+NTAccount+"'",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function mySucces(response) {
            $scope.Customers = response.data.d;
            var myDate = new Date();
            $scope.status = "loaded at " + myDate.toLocaleTimeString();
            //$scope.searchProfitCenterResult = 'click to select ProfitCenter';

        }, function myError(response) {
            $scope.status = response.status;
        })
});