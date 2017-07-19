var myUtility = {};

myUtility.getParam = function(paramName) {
    var url = window.location.href;
    var startIndex = url.indexOf("?");
    url = "&" + url.substring(startIndex + 1);
    paramName = "&" + paramName + "=";
    var i = url.indexOf(paramName, 0);
    if (i < 0) {
        return "";
    }
    var j = url.indexOf("&", i + 1);
    var k = url.indexOf("=", j + 1);
    if (k < 0) {//TODO: use regular expression replace this
      j = -1;
    }

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
myUtility.formatSPSourceUrl = function(url) {
    url = url.replace(/%3A/g, ":");
    url = url.replace(/%2F/g, "/");
    url = url.replace(/%2E/g, ".");
    url = url.replace(/%2D/g, "-");
    url = url.replace(/%23/g, "#");
    url = url.replace(/%3F/g, "?");
    url = url.replace(/%3D/g, "=");
    url = url.replace(/%26/g, "&");
    url = url.replace(/%7B/g, "{");
    url = url.replace(/%7D/g, "}");
    url = url.replace(/%25/g, "%");
    return url;
};

var headers = {
    "accept": "application/json;odata=verbose",
};

var ngHttp;

myUtility.buildSPHelper = function(obj) {
    ngHttp = obj.$http;
    initFields(obj.fieldsConfig);
    var id = myUtility.getParam("ID");
    return {
        loadFromSP: function(success, error) {
            HttpGet(obj.SPList + "(" + id + ")", function(result) {
                copyToScope(obj.fieldsConfig, result.d, obj.$scope);
                if (success) {
                    success();
                }
            }, error);
        },
        saveToSP: function(listName, isMerge, success, error) {
            SPPost({
                url: isMerge ? obj.SPList + "(" + id + ")" : obj.SPList,
                metadata: createMetadata(listName, obj.fieldsConfig, obj.$scope),
                isMerge: isMerge,
                success: success,
                error: error,
                SPServer: obj.SPServer,
            });
        },
    };
};

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

function createMetadata(listName, fieldsConfig, $scope) {
    var metadata = {
        __metadata: {
            type: "SP.Data." + listName + "ListItem"
        },
    };
    for (var key in fieldsConfig) {
        var obj = fieldsConfig[key];
        var value = $scope[obj.ngFieldName];
        if (value != undefined && value != null) {
            metadata[obj.SPFieldName] = value.toString();
        }
    }
    return metadata;
};

function copyToScope(fieldsConfig, d, $scope) {
    for (var key in fieldsConfig) {
        var obj = fieldsConfig[key];
        var value = d[obj.SPFieldName];
        if (value != undefined && value != null) {
            if (obj.ngFieldType === "text") {
                $scope[obj.ngFieldName] = value;
            } else if (obj.ngFieldType === "array") {
                $scope[obj.ngFieldName] = value.split(",");
            }
        }
    }
};

function SPPost(obj) {
    getFormDigestService(obj.SPServer, function(digest) {
        ngHttp({
            url: obj.url,
            method: "POST",
            data: JSON.stringify(obj.metadata),
            headers: getSPHeaders4Post(obj.metadata.length, obj.isMerge, digest),
        }).then(function(response) {
            if (obj.success) {
                obj.success(response.data);
            }
        }, obj.error);
    })
};

function getSPHeaders4Post(ContentLength, isMerge, digest) {
    var SPHeaders = {
        "accept": "application/json;odata=verbose",
        "content-type": "application/json;odata=verbose",
        "content-length": ContentLength,
        "X-RequestDigest": digest,
    };
    if (isMerge) {
        SPHeaders["X-HTTP-Method"] = "MERGE";
        SPHeaders["IF-MATCH"] = "*";
    }
    return SPHeaders;
};

function getFormDigestService(SPServer, success) {
    ngHttp({
        url: SPServer + "_api/contextinfo",
        method: "POST",
        data: '',
        headers: headers,
    }).then(function(response) {
        var result = response.data;
        digest = result.d.GetContextWebInformation.FormDigestValue;
        if (success) {
            success(digest);
        }
    });
};

//jquery sometimes not refresh angular
/*function AjaxGet(url, success, error) {
    $.ajax({
        url: url,
        type: "GET",
        headers: headers,
        success: success,
        error: error,
    });
};*/
function HttpGet(url, success, error = defaultError) {
    ngHttp({
        url: url,
        method: "GET",
        headers: headers,
    }).then(function(response) {
        if (success) {
            success(response.data, response.config.url);
        }
    }, error);
};

myUtility.buildHttpGet = function($Http, defaultError) {
    ngHttp = $Http;
    return function(url, success, error = defaultError) {
        HttpGet(url, success, error);
    };
};

module.exports = myUtility;
