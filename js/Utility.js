
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

module.exports = myUtility;
