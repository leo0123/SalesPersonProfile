var myUtility = {};
myUtility.getParam = function(paramName) {
    var url = window.location.href;
    var startIndex = url.indexOf("?");
    var i = url.indexOf(paramName, startIndex);
    if (i < 0) {
        return "";
    }
    var j = url.indexOf("&", i);
    i = i + paramName.length + 1;
    var param;
    if (j > 0) {
        param = url.substring(i, j);
    } else {
        param = url.substring(i);
    }
    return param;
};

module.exports = myUtility
