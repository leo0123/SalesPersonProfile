
var dataService = "http://amdpfweb02:9999/SAPBW3DataService.svc/";
var dataUrlNewNtAccount = dataService + "vSalesAccount4LoadProfile";
var dataUrlHr = dataService + "vSalesHrInfo4LoadProfile"; ///?$filter=ID ge 1";
var dataUrlOldAccount = dataService + "vEmployee_Account4LoadProfile?$orderby=ID";
var dataUrlUsersLine = dataService + "vUsersLine4LoadProfile";
var dataUrlSalesOrgDivision = dataService + "vSalesOrgDivision4LoadProfile?$orderby=ID";
var listServer = "http://sp2013portal.delta-corp.com/sites/MyDelta/";
var digestUrl = listServer + "_api/contextinfo";
var listUrl = listServer + "_api/web/lists/getbytitle('Sales Person Profile')/items";
var SPUserProfileUrl = listServer + "_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=" //'delta\username'
var metaDataType = {
    type: "SP.Data.SalesPersonProfileListItem"
};
var headers4get = {
    accept: 'application/json;odata=verbose'
};
var digest = null;
var url4GetData;
var currentCall = null;
var list;
var x;
var total = 0;
var m = 0;
var n = 0;
var l = 0;
var c = 1;

$(function() {
    var type;
    //type = "NTAccount";
    //type = "HR"
    //type = "OldAccount";
    type = "ADInfo"
    switch (type) {
        case "NTAccount":
            url4GetData = dataUrlNewNtAccount;
            currentCall = create;
            break;
        case "HR":
            url4GetData = dataUrlHr;
            currentCall = updateFromHr;
            break;
        case "OldAccount":
            url4GetData = dataUrlOldAccount;
            currentCall = updateOldAccount;
            break;
        case "ADInfo":
            url4GetData = listUrl + "?$top=999";
            currentCall = getADInfo;
            break;
    }
    getFormDigestService();
});

function getFormDigestService() {
    $.ajax({
        url: digestUrl,
        type: 'post',
        data: '',
        headers: headers4get,
        success: function(data) {
            digest = data.d.GetContextWebInformation.FormDigestValue;
            $("#msg").text(digest);
            ajaxget(url4GetData);
        }
    });
};

function getSalesOrgDivision() {
    $.getJSON(dataUrlSalesOrgDivision, function(data) {
        l = 0;
        m = 0;
        n = 0;
        list = data.d;
        total = list.length;
        $("#msg").text("Total: " + total);
        x = 0;
        updateSalesOrgDivision();
    });
};

function getSalesOrgDivisionMetadata(item) {
    var id = item.ID;
    //var tList = [item];
    var oList = [item.SalesOrg];
    var dList = [item.Division];
    x++;
    while (x < list.length && id == list[x].ID) {
        //tList.push(list[x]);
        if (oList.indexOf(list[x].SalesOrg) < 0) {
            oList.push(list[x].SalesOrg)
        }
        if (dList.indexOf(list[x].Division) < 0) {
            dList.push(list[x].Division);
        }
        x++;
    }
    x--;

    var metadata = {
        __metadata: metaDataType,
        Sales_x0020_Org: oList.toString(),
        Division: dList.toString()
    };
    return metadata;
};
var xi;

function updateSalesOrgDivision() {
    if (x >= list.length) {
        $("#msg").text("Total:" + total + ";Finish:" + x);
        return;
    }
    var item = list[x];
    var id = item.ID;
    var lastx = x;
    var metadata = getSalesOrgDivisionMetadata(item);
    xi = x - lastx + 1;
    $.ajax({
        url: listUrl + "(" + id + ")",
        type: 'post',
        data: JSON.stringify(metadata),
        headers: {
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*",
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "content-length": metadata.length,
            "X-RequestDigest": digest
        },
        dataType: 'json',
        success: function(data) {
            x++;
            m += xi;
            showMsg();
            updateSalesOrgDivision();
        },
        error: function(data) {
            x++;
            n += xi;
            showMsg();
            updateSalesOrgDivision();
        }
    });
};

function getUsersLine() {
    $.getJSON(dataUrlUsersLine, function(data) {
        l = 0;
        m = 0;
        n = 0;
        list = data.d;
        total = list.length;
        $("#msg").text("Total: " + total);
        x = 0;
        updateUsersLine();
    });
};

function getUsersLineMetadata(item) {

    var metadata = {
        __metadata: metaDataType,
        Permission: item.Condition,
        Effective_x0020_Permission: item.Condition //,
        //JSONStr: ""//item.Condition
    };
    return metadata;
};

function updateUsersLine() {
    if (x >= list.length) {
        $("#msg").text("Total:" + total + ";Finish:" + x);
        return;
    }
    var item = list[x];
    var id = item.ID;
    var metadata = getUsersLineMetadata(item);
    $.ajax({
        url: listUrl + "(" + id + ")",
        type: 'post',
        data: JSON.stringify(metadata),
        headers: {
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*",
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "content-length": metadata.length,
            "X-RequestDigest": digest
        },
        dataType: 'json',
        success: function(data) {
            x++;
            updateUsersLine();
            m++;
            showMsg();
        },
        error: function(data) {
            x++;
            updateUsersLine();
            n++;
            showMsg();
        }
    });
};

function getMetadata4AD(item) {
    return {
        __metadata: metaDataType,
        Name: item.Name,
        Email: item.Email,
        BG: item.BG,
        Company: item.Company,
        Office: item.Office
    };
};
function updateAdInfo() {
    if (list.length == 0) {
        return;
    }
    var item = list.shift();
    var metadata = getMetadata4AD(item);
    ajaxpost(item.ID, metadata);
};
var adList = [];
function getADInfo() {
    if (list.length == 0) {
        list = adList;
        l = 0;
        m = 0;
        n = 0;
        x = 0;
        total = list.length;
        $("#msg").text("Total:" + total);
        currentCall = updateAdInfo;
        updateAdInfo();
        return;
    }
    var item = list.shift();
    var url = SPUserProfileUrl + "'delta\\" + item.DomainAccount + "'";
    ajaxget(url, function(data) {
        var d = data.d;
        if (!d.DisplayName) {
            myError();
            return;
        }
        item.Name = d.DisplayName;
        item.Email = d.Email;
        item.BG = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Department";
        }).Value;
        item.Company = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Company";
        }).Value;
        item.Office = d.UserProfileProperties.results.find(function(prop) {
            return prop.Key == "Office";
        }).Value;
        adList.push(item);
        mySuccess();
    });
};

function getMetadata4OldAccount(subList) {
    var emailList = [];
    var SAPIDList = [];
    var otherAccountList = [];
    for (var i = 0; i < subList.length; i++) {
        var oneAccount = subList[i].Account.toLowerCase();
        if (oneAccount.includes("@")) {
            emailList.push(oneAccount);
        } else if (!isNaN(parseInt(oneAccount))) {
            SAPIDList.push(oneAccount);
        } else {
            otherAccountList.push(oneAccount);
        }
    }
    return {
        __metadata: metaDataType,
        OldEmail: emailList.toString(),
        OldSAPID: SAPIDList.toString(),
        OtherAccount: otherAccountList.toString()
    };
};
function updateOldAccount() {
    var subList = [];
    var lastItem;
    var item;
    do {
        lastItem = list.shift();
        subList.push(lastItem);
        if (list.length == 0) {
            break;
        }
        item = list[0];
    } while (lastItem.ID == item.ID);
    var metadata = getMetadata4OldAccount(subList);
    c = subList.length;
    ajaxpost(lastItem.ID, metadata);
};

function getMetadata4Hr(item) {
    var Terminate_Date = item.Terminate_Date;
    if (Terminate_Date) {
        Terminate_Date = new Date(parseInt(Terminate_Date.substr(6)));
    }
    return {
        __metadata: metaDataType,
        Name: item.Name,
        EmployeeID: item.Race,
        EmployeeCode: item.Emp_Code,
        SalesP: item.SalesP,
        TerminateDate: Terminate_Date,
        Status: item.Status
    };
};
function updateFromHr() {
    if (list.length == 0) {
        return;
    }
    var item = list.shift();
    var metadata = getMetadata4Hr(item);
    ajaxpost(item.ID, metadata);
};

function create() {
    if (list.length == 0) {
        return;
    }
    var item = list.shift();
    var metadata = {
        __metadata: metaDataType,
        DomainAccount: item.SalesPerson,
        BG: item.BG,
        Company: item.Company
    };
    ajaxpost(null, metadata);
};

function firstCall(data) {
    l = 0;
    m = 0;
    n = 0;
    x = 0;
    list = data.d;
    if (list.results) {
        list = list.results;
    }
    total = list.length;
    $("#msg").text("Total:" + total);
    currentCall();
};

function mySuccess(data) {
    m = m + c;
    showMsg();
    x++;
    currentCall();
};

function myError(data) {
    n = n + c;
    showMsg();
    x++;
    currentCall();
};

function getHeaders4Post(metadata, isMerge) {
    if (isMerge) {
        return {
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*",
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "content-length": metadata.length,
            "X-RequestDigest": digest
        };
    } else {
        return {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "content-length": metadata.length,
            "X-RequestDigest": digest
        };
    }
};

function ajaxpost(id, metadata, success = mySuccess, error = myError) {
    var url = listUrl;
    var isMerge = false;
    if (id || id === 0) {
        url = url + "(" + id + ")";
        isMerge = true;
    }
    $.ajax({
        url: url,
        type: 'post',
        data: JSON.stringify(metadata),
        headers: getHeaders4Post(metadata, isMerge),
        dataType: 'json',
        success: success,
        error: error
    });
};

function ajaxget(url, success = firstCall) {
    $.ajax({
        url: url,
        type: "get",
        headers: headers4get,
        success: success
    });
};

function showMsg() {
    $("#msg").text("Total: " + total + "; success: " + m + "; error: " + n + "; miss: " + l);
};
