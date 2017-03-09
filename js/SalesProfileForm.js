var $ = require("jquery");
//var myConfig = require("../MyConfig.js");

(function () {
	var listServer = myConfig.listServer;
	var SPUserProfileUrl = myConfig.SPUserProfileUrl
	var dataService = "http://amdpfweb02:8080/SAPBW3DataService.svc/";
	var dataUrlHr = dataService + "VSalesPersonAccount4LoadProfile/";
	var listUrl = listServer + "_api/web/lists/getbytitle('Sales Person Profile')/items";
	//test git1
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

	var readyToSave = 0;

	$(document).ready(function () {
		//$("[value='Save']").hide();
		//$("[value='Cancel']").hide();
		$("[title='spHide']").hide();
		$("[id='Ribbon.ListForm.Edit.Commit.Publish-Large']").hide();

		spDomainAccount = $("[title='Domain Account Required Field']");
		spEmployeeID = $("[title='Employee ID']");
		spEmployeeCode = $("[title='Employee Code']");
		spSalesP = $("[title='SalesP']");
		spStatus = $("[title='Status']");
		spTerminateDate = $("[title='Terminate Date']");
		spName = $("[title='Name Required Field']");
		spDepartment = $("[title='Department']");
		spCompany = $("[title='Company']");
		spEmail = $("[title='Email']");
		spOffice = $("[title='Office']");
		spPermission = $("[title='Permission']");
		spJSONStr = $("[title='JSONStr']");
		//alert(spJSONStr.val());

		spDomainAccount.attr("readonly", "readonly");
		spEmployeeID.attr("readonly", "readonly");
		spEmployeeCode.attr("readonly", "readonly");
		spSalesP.attr("readonly", "readonly");
		spStatus.attr("readonly", "readonly");
		spTerminateDate.attr("readonly", "readonly");
		spName.attr("readonly", "readonly");
		spDepartment.attr("readonly", "readonly");
		spCompany.attr("readonly", "readonly");
		spEmail.attr("readonly", "readonly");
		spOffice.attr("readonly", "readonly");
		spPermission.attr("readonly", "readonly");

		$("#btSave").click(function () {
			$("#msg").text("");
			var SPUserName = getSPUserName();
			if (SPUserName != undefined && (readyToSave < 2 || SPUserName != spDomainAccount.val())) {
				$("#msg").text("Data not ready to save");
				return;
			}
			$("[value='Save']").click();
		});
		$("#btCancel").click(function () {
			$("[value='Cancel']").click();
		});

	});

	function getSPUserName() {
		var SPUserName = $("[id='divEntityData']").attr("key");
		if (SPUserName == undefined) {
			return SPUserName;
		}
		SPUserName = SPUserName.substr(SPUserName.indexOf("\\") + 1);
		//SPUserName="Tim.Jordan";
		return SPUserName;
	};

	/*function successHandler(data) {
		var Name = data.d.DisplayName;
		var Email = data.d.Email;
		var Department = data.d.UserProfileProperties.results.find(getDept).Value;
		var Company = data.d.UserProfileProperties.results.find(getCom).Value;
		var Office = data.d.UserProfileProperties.results.find(getOffice).Value;

		spName.val(Name);
		spDepartment.val(Department);
		spCompany.val(Company);
		spEmail.val(Email);
		spOffice.val(Office);
		readyToSave++;
	};
	function errorHandler(data) {};*/
	/*function getDept(prop) {
		return prop.Key == "Department";
	};
	function getCom(prop) {
		return prop.Key == "Company";
	};
	function getOffice(prop) {
		return prop.Key == "Office";
	};*/

})();
