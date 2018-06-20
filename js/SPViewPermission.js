var $ = require("jquery");
var ViewPermissionListName = "ViewPermission";
var SPServerUrl = _spPageContextInfo.siteAbsoluteUrl + "/";
var ViewPermissionList = SPServerUrl + "_api/Web/Lists/getbytitle('"+ViewPermissionListName+"')/Items";
var pathArray = window.location.pathname.split("/");
var pageName = pathArray.pop().split(".").shift();
var listName = pathArray.pop();
var currentUserUrl = SPServerUrl + "_api/Web/currentUser";

var headers = {
    "accept": "application/json;odata=verbose",
};

$(()=>{
    $("[summary='"+listName+"']").hide();
});

async function main(){
    var userName = await getCurrentUser();
    var url = ViewPermissionList + "/?$select=ViewName&$filter=ListName eq '"+listName+"' and UserName eq '"+userName+"' ";
    var allowedViews = await getAllowedViews();
    if (allowedViews.includes(pageName)){
        $("[summary='"+listName+"']").show();
    } else {
        window.location.replace(window.location.pathname.replace(pageName+".aspx",allowedViews[0]+".aspx"));
    }

    function getAllowedViews(){
        return fetchJson(url)
                .then(d=>{
                    return d.results.map(a=>a.ViewName);
                });
    }

    function getCurrentUser(){
        return fetchJson(currentUserUrl)
                .then(d=>{
                    return d.LoginName.split("\\").pop();
                });
    }
    
    function fetchJson(url){
        return fetch(url, {
                    credentials: 'same-origin',
                    headers: headers
                })
                .then(response=>{
                    return response.json();
                })
                .then(data=>{
                    return data.d;
                });
    }
}

main();