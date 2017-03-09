var myPermissionApp=require("./MyPermissionCtrl.js");
var myPermissionModel=require("./MyModel.js");
var angular=require("angular");
var $=require("jquery");
require("angular-material");

(function () {
	var spDomainAccount;
	var spEmployeeID;
	var spEmployeeCode;
	var spSalesP;
	var spStatus;
	var spTerminateDate;
	var spName;
	var spDepartment;
	var spCompany;
	var spEmail;
	var spOffice;
	var spPermission;

	$(function(){
		spDomainAccount = $("[title='Domain Account Required Field']");
		spEmployeeID = $("[title='Employee ID']");
		spEmployeeCode = $("[title='Employee Code']");
		spSalesP = $("[title='SalesP']");
		spStatus = $("[title='Status']");
		spTerminateDate = $("[title='Terminate Date']");
		spName = $("[title='Name Required Field']");
		spDepartment = $("[title='Department']");
		spBG = $("[title='BG']");
		spCompany = $("[title='Company']");
		spEmail = $("[title='Email']");
		spOffice = $("[title='Office']");
		spPermission = $("[title='Permission']");
		spJSONStr = $("[title='JSONStr']");
	});


	var myApp = angular.module('myApp', ['ngMaterial']);
	var spDomainAccountTitle = "[title='Domain Account Required Field']";

	function init() {
		myApp.controller('myCtrl', myCtrl);
		myApp.controller('myPermissionCtrl', myPermissionApp.myPermissionCtrl);
		myApp.controller('mySalesOrgCtrl', mySalesOrgCtrl);
		myApp.controller('myDivisionCtrl', myDivisionCtrl);
		if (isNew()) {
			myApp.controller('myDomainAccountCtrl', myDomainAccountCtrl);
		}
	};

	function log(str) {
		console.log(str);
	};

	function isNew() {
		if ($(spDomainAccountTitle).val()) {
			return false
		} else {
			return true;
		}
	};

	function myCtrl($scope) {
		//var log = log;
		$scope.permissionHtmlUrl = myPermissionModel.UrlList.permissionHtmlUrl;
		$scope.SalesOrgHtmlUrl = myPermissionModel.UrlList.SalesOrgHtmlUrl;
		$scope.DivisionHtmlUrl = myPermissionModel.UrlList.DivisionHtmlUrl;
		if (isNew()) {
			$scope.DomainAccountHtmlUrl = myPermissionModel.UrlList.DomainAccountHtmlUrl;
		} else {
			$("#SPDomainAccountContainer").show();
		}
		$scope.$on('selectedSalesOrgChanged', function (e, d) {
			$scope.$broadcast('reloadDivisionOption', d);
		});
		$scope.$on('CompanyChanged', function (e, d) {
			$scope.$broadcast('reloadSalesOrgOption', d);
		});
	};

	function myDomainAccountCtrl($scope, $http) {
		var spDomainAccount = $(spDomainAccountTitle);
		loadOption();

		$scope.selectedChanged = function () {
			var d = $scope.selectedValue;
			spDomainAccount.val(d.ntaccount);
			console.log(spEmployeeID);
			var Race = d.Race;
			var Emp_Code = d.Emp_Code;
			var SalesP = d.SalesP;
			var Status = d.Status;
			var Terminate_Date = d.Terminate_Date;
			if (Terminate_Date != null) {
				Terminate_Date = new Date(parseInt(Terminate_Date.substr(6)));
			}

			spEmployeeID.val(Race);
			spEmployeeCode.val(Emp_Code);
			spSalesP.val(SalesP);
			spStatus.val(Status);
			spTerminateDate.val(Terminate_Date);

			loadSPUserProfile();
		};

		function loadOption() {
			var urlStr = myPermissionModel.UrlList.serviceUrl + "VSalesPersonAccount4LoadProfile/?$filter=ntaccount ne ''";
			$http({
				method: "GET",
				url: urlStr,
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}).then(function mySucces(response) {
				$scope.Options = response.data.d;
			}, function myError(response) {});
		};

		function loadSPUserProfile() {
			var urlStr = myPermissionModel.UrlList.SPUserProfileUrl + "'delta\\" + spDomainAccount.val() + "'";
			$http({
				method: "GET",
				url: urlStr,
				headers: {
					//'Content-Type': 'application/json; charset=utf-8'
					"accept": "application/json;odata=verbose"
				}
			}).then(function mySucces(response) {
				var d = response.data.d;
				var Name = d.DisplayName;
				var Email = d.Email;
				var Department = d.UserProfileProperties.results.find(getDept).Value;
				var Company = d.UserProfileProperties.results.find(getCom).Value;
				var Office = d.UserProfileProperties.results.find(getOffice).Value;
				spName.val(Name);
				spDepartment.val(Department);
				spBG.val(Department)
				spCompany.val(Company);
				spEmail.val(Email);
				spOffice.val(Office);
				$scope.$emit('CompanyChanged', spCompany.val());
			}, function myError(response) {});

			function getDept(prop) {
				return prop.Key == "Department";
			};
			function getCom(prop) {
				return prop.Key == "Company";
			};
			function getOffice(prop) {
				return prop.Key == "Office";
			};
		};

	};

	function mySalesOrgCtrl($scope, $http) {
		var company = $("[title='Company']").val();
		if (company) {
			loadOption();
		}
		var spSalesOrg = $("[title='Sales Org']");
		$scope.selectedSalesOrg = spSalesOrg.val().split(",");

		$scope.selectedChanged = function () {
			spSalesOrg.val($scope.selectedSalesOrg);
			$scope.$emit('selectedSalesOrgChanged', $scope.selectedSalesOrg);
		};

		$scope.$on('reloadSalesOrgOption', function (e, d) {
			loadOption();
		});

		function loadOption() {
			company = $("[title='Company']").val();
			var urlStr = myPermissionModel.UrlList.serviceUrl + "vCompanyOrg4SalesProfile/?$filter=Company eq '" + company + "'";
			$http({
				method: "GET",
				url: urlStr,
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}).then(function mySucces(response) {
				$scope.SalesOrgOptions = response.data.d;
			}, function myError(response) {});
		};
	};

	function myDivisionCtrl($scope, $http) {
		var log = log;
		loadOption();
		var spDivision = $("[title='Division']");
		$scope.selectedDivision = spDivision.val().split(",");

		$scope.selectedChanged = function () {
			spDivision.val($scope.selectedDivision);
		};

		$scope.$on('reloadDivisionOption', function (e, d) {
			loadOption();
		});

		function loadOption() {
			var SalesOrg = $("[title='Sales Org']").val();
			if (!SalesOrg) {
				$scope.DivisionOptions = null;
				return;
			}
			var orgList = SalesOrg.split(",");
			var filter;
			for (var org in orgList) {
				if (filter) {
					filter += " or SalesOrg eq '" + orgList[org] + "'";
				} else {
					filter = "SalesOrg eq '" + orgList[org] + "'";
				}
			}
			var urlStr = myPermissionModel.UrlList.serviceUrl + "vSalesOrgDivision4SalesProfile/?$filter=" + filter
				 + "&&$orderby=Division";
			$http({
				method: "GET",
				url: urlStr,
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}).then(function mySucces(response) {
				$scope.DivisionOptions = distinctList(response.data.d);
			}, function myError(response) {});
		};

		function distinctList(oList) {
			var tList = [];
			for (var i in oList) {
				if (!tList.includes(oList[i].Division)) {
					tList.push(oList[i].Division);
				}
			}
			return tList;
		};
	};

	init();
})();
