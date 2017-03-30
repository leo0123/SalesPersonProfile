var mySPField = require("./SPField.js")

var myUtility = {};

myUtility.getParam = function(paramName) {
    var url = window.location.href;
    var startIndex = url.indexOf("?");
    paramName = paramName + "=";
    var i = url.indexOf(paramName, startIndex);
    if (i < 0) {
        return "";
    }
    var j = url.indexOf("&", i);
    i = i + paramName.length;
    var param;
    if (j > 0) {
        param = url.substring(i, j);
    } else {
        param = url.substring(i);
    }
    while (param.includes("%20")) {
        param = param.replace("%20", " ");
    };
    return param;
};

myUtility.SPHelper = {};
var SPFields = {};

function init(SPFieldsConfig, $) {
    for (var key in SPFieldsConfig) {
        var SPFieldConfig = SPFieldsConfig[key];
        SPFields[key] = mySPField.factory(SPFieldConfig.title, SPFieldConfig.type);
    }
    for (var key in SPFields) {
        var SPField = SPFields[key];
        SPField.initControl($);
        SPField.ngField = SPField.ngField ? SPField.ngField : key;
    }
};
myUtility.SPHelper.loadFromSpFields = function(SPFieldsConfig, $, $scope) {
    init(SPFieldsConfig, $);
    for (var key in SPFields) {
        var SPField = SPFields[key];
        $scope[SPField.ngField] = SPField.getValue();
    }
};
myUtility.SPHelper.copyToSpFields = function($scope) {
    for (var key in SPFields) {
        var SPField = SPFields[key];
        SPField.setValue($scope[SPField.ngField]);
    }
};

var headers = {
    "accept": "application/json;odata=verbose"
};
myUtility.FieldsHelper = {};

function initFields(fieldsConfig) {
    for (var key in fieldsConfig) {
        var obj = fieldsConfig[key];
        if (!obj.SPFieldName) {
            obj.SPFieldName = key;
        }
        if (!obj.ngFieldName) {
            obj.ngFieldName = key;
        }
        if (!obj.ngFieldType) {
            obj.ngFieldType = "text";
        }
    }
};
var helper;
myUtility.FieldsHelper.init = function(_$http, _$scope, _fieldsConfig, _SPList, SPServer) {
    helper = {
        $http: _$http,
        $scope: _$scope,
        fieldsConfig: _fieldsConfig,
        SPList: _SPList
    };
    initFields(_fieldsConfig);
    getFormDigestService(SPServer);
};
myUtility.FieldsHelper.loadFromSP = function(success, error) {
    if (!helper) {
        console.log("FieldsHelper need init first");
    }
    var id = myUtility.getParam("ID");
    helper.itemUrl = helper.SPList + "(" + id + ")";
    httpget(helper.itemUrl, function(response) {
        var d = response.data.d;
        var fieldsConfig = helper.fieldsConfig;
        var $scope = helper.$scope;
        for (var key in fieldsConfig) {
            var obj = fieldsConfig[key];
            var value = d[obj.SPFieldName];
            if (value || value === false) {
                if (obj.ngFieldType === "text") {
                    $scope[obj.ngFieldName] = value;
                } else if (obj.ngFieldType === "array") {
                    $scope[obj.ngFieldName] = value.split(",");
                }
            }
        }
        if (success) {
            success();
        }
    }, error);
};
myUtility.FieldsHelper.saveToSP = function(listName, isMerge, success, error) {
    if (!helper) {
        console.log("FieldsHelper need init first");
    }
    var metadata;
    metadata = {
        __metadata: {
            type: "SP.Data." + listName + "ListItem"
        },
    };
    for (var key in fieldsConfig) {
        var obj = fieldsConfig[key];
        metadata[obj.SPFieldName] = $scope[obj.ngFieldName].toString();
    }
    httppost(metadata, isMerge, success, error);
};

function httppost(metadata, isMerge, success, error) {
    helper.$http({
        method: "POST",
        url: helper.itemUrl,
        data: JSON.stringify(metadata),
        headers: getHeaders4Post(metadata, isMerge),
        dataType: 'json',
    }).then(success, error);
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

function getFormDigestService(SPServer) {
    helper.$http({
        url: SPServer + "_api/contextinfo",
        method: 'POST',
        data: '',
        headers: headers,
    }).then(function(response) {
        helper.digest = response.data.d.GetContextWebInformation.FormDigestValue;
    });
};

function httpget(url, success, error) {
    helper.$http({
        method: "GET",
        url: url,
        headers: headers
    }).then(success, error);
};

module.exports = myUtility;
