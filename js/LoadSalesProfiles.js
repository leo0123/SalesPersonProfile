
var dataService = "http://amdpfweb02:8080/SAPBW3DataService.svc/";
var dataUrl = dataService + "vSalesAccount4LoadProfile";
var dataUrlHr = dataService + "VSalesPersonAccount4LoadProfile"; ///?$filter=ID ge 1";
var dataUrlOldAccount = dataService + "VEmployee_Account4LoadProfile";
var dataUrlUsersLine = dataService + "vUsersLine4LoadProfile";
var dataUrlSalesOrgDivision = dataService + "vSalesOrgDivision4LoadProfile?$orderby=ID";
var listServer = "http://amdpfwfe02:9999/";
var digestUrl = listServer + "_api/contextinfo";
var listUrl = listServer + "_api/web/lists/getbytitle('Sales Person Profile')/items";
var digest = null;
var metaDataType = "SP.Data.Sales_x0020_Person_x0020_ProfileListItem";

(function importData() {
    start(getNTAccount);
    //start(getDataFromHr);
    //start(getOldAccout);
    //start(getUsersLine);
    //start(getSalesOrgDivision);
})();

function start(call) {
    getFormDigestService(call);
};

function getFormDigestService(call) {
    $.ajax({
        url: digestUrl,
        type: 'post',
        data: '',
        headers: {
            'Accept': 'application/json;odata=verbose'
        },
        success: function(data) {
            digest = data.d.GetContextWebInformation.FormDigestValue;
            $("#msg").text(digest);
            call();
        }
    });
};

var list;
var x;

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
        __metadata: {
            type: metaDataType
        },
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
            isDone();
            updateSalesOrgDivision();
        },
        error: function(data) {
            x++;
            n += xi;
            isDone();
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
        __metadata: {
            type: metaDataType
        },
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
            isDone();
        },
        error: function(data) {
            x++;
            updateUsersLine();
            n++;
            isDone();
        }
    });
};

function getOldAccout() {
    $.getJSON(dataUrlOldAccount, function(data) {
        l = 0;
        m = 0;
        n = 0;
        list = data.d;
        total = list.length;
        $("#msg").text("Total: " + total);
        list.sort(function(a, b) {
            return a.ID - b.ID;
        });
        x = 1;
        updateOldAccount();
    });
};

function updateOldAccount() {
    if (x >= total) {
        x--;
        //$("#msg").text("Total:"+total+";Finish:"+x);
        return;
    }
    var start = x - 1;
    var end = start;
    var pID = list[start].ID;
    var t = total;
    for (var i = x; i < t; i++) {
        var ID = list[i].ID;
        if (pID == ID) {
            if (i == total - 1) {
                i++;
            } else {
                continue;
            }
        }
        t = i;
        end = i;
        x = i;
        l = end - start;
        var subList = list.slice(start, end);
        var metadata = getOldAccountMetadata(subList);
        $.ajax({
            url: listUrl + "(" + pID + ")",
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
                m = m + l;
                l = 0;
                isDone();
                x++;
                updateOldAccount();
            },
            error: function(data) {
                n = n + l;
                l = 0;
                isDone();
                x++;
                updateOldAccount();
            }
        });
    }
};

function getOldAccountMetadata(subList) {
    var item = subList[0];
    var OldEmail = "";
    var OldSAPID = "";
    var OtherAccount = "";
    var NTAccount = item.DomainAccount.toLowerCase(); //item.Title.substring(13).toLowerCase();
    var SalesP = item.SalesP.toLowerCase();
    var Email = null;
    if (item.Email != null) {
        Email = item.Email.toLowerCase();
    }
    var Name = item.Name.toLowerCase();
    for (var i = 0; i < subList.length; i++) {
        var oneAccount = subList[i].Account.toLowerCase();
        if (oneAccount.includes("@")) {
            if (oneAccount != Email) {
                OldEmail += oneAccount + ";";
            }
        } else if (!isNaN(parseInt(oneAccount))) {
            if (oneAccount != item.Employee_x0020_ID) {
                OldSAPID += oneAccount + ";";
            }
        } else {
            if (oneAccount != Name && oneAccount != SalesP && oneAccount != NTAccount) {
                OtherAccount += oneAccount + ";";
            }
        }
    }
    var metadata = {
        __metadata: {
            type: metaDataType
        },
        Old_x0020_Email: OldEmail,
        Old_x0020_SAP_x0020_ID: OldSAPID,
        Other_x0020_Account: OtherAccount
    };
    return metadata;
};

function getDataFromHr() {
    $.getJSON(dataUrlHr, function(data) {
        l = 0;
        m = 0;
        n = 0;
        list = data.d;
        total = list.length;
        $("#msg").text("Total: " + total);
        x = 0;
        updateFromHr();
    });
};

function getMetadataFromHr(item) {
    var Terminate_Date = item.Terminate_Date;
    if (Terminate_Date != null) {
        Terminate_Date = new Date(parseInt(Terminate_Date.substr(6)));
    }
    var metadata = {
        __metadata: {
            type: metaDataType
        },
        Name: item.Name,
        Employee_x0020_ID: item.Race,
        Employee_x0020_Code: item.Emp_Code,
        SalesP: item.SalesP,
        Terminate_x0020_Date: Terminate_Date,
        Status: item.Status
    };
    return metadata;
};

function updateFromHr() {
    if (x >= list.length) {
        $("#msg").text("Total:" + total + ";Finish:" + x);
        return;
    }
    var item = list[x];
    var id = item.ID;
    var metadata = getMetadataFromHr(item);
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
            updateFromHr();
            m++;
            isDone();
        },
        error: function(data) {
            x++;
            updateFromHr();
            n++;
            isDone();
        }
    });
};

function getNTAccount() {
    $.getJSON(dataUrl, function(data, status) {
        l = 0;
        m = 0;
        n = 0;
        x = 0;
        list = data.d;
        total = list.length;
        $("#msg").text("Total:" + total);
        //uploadNTAccount(data.d);
        create();
    });
};
/*
function uploadNTAccount(AccountList) {
alert(AccountList.length);
total = AccountList.length;
for (var i = 0; i < total; i++) {//AccountList.length
var oneSales = AccountList[i];
create(oneSales.SalesPerson);
}
};*/

var total = 0;
var m = 0;
var n = 0;
var l = 0;

function create() {
    if (x == total) {
        return;
    }
    var item = list[x];
    var metadata = {
        __metadata: {
            type: 'SP.Data.Sales_x0020_Person_x0020_ProfileListItem'
        },
        Title: item.SalesPerson,
        Name: item.SalesPerson
    }; //'i:0#.w|delta\\' +
    $.ajax({
        url: listUrl,
        type: 'post',
        data: JSON.stringify(metadata),
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "content-length": metadata.length,
            "X-RequestDigest": digest
        },
        dataType: 'json',
        success: function(data) {
            m++;
            isDone();
            x++;
            create();
        },
        error: function(data) {
            n++;
            isDone();
            x++;
            create();
        }
    });
};
/*
function create(title) {
return;
var metadata = { __metadata: { type: 'SP.Data.Sales_x0020_Person_x0020_ProfileListItem' }, Title: title, Name: title };//'i:0#.w|delta\\' +
$.ajax({
url: listUrl,
type: 'post',
data: JSON.stringify(metadata),
headers: {
"accept": "application/json;odata=verbose",
"content-type": "application/json;odata=verbose",
"content-length": metadata.length,
"X-RequestDigest": digest
},
dataType: 'json',
success: function (data) {
m++;
isDone();
},
error: function (data) {
n++;
isDone();
}
});
};*/

function isDone() {
    $("#msg").text("Total: " + total + "; success: " + m + "; error: " + n + "; miss: " + l);
};
