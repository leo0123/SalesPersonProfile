var $ = require("jquery");
var ViewPermissionListName = "ViewPermission";
var ListViewGroupListName = "ListViewGroup";
var SPServerUrl = _spPageContextInfo.siteAbsoluteUrl + "/";
var ViewPermissionListUrl = SPServerUrl + "_api/Web/Lists/getbytitle('" + ViewPermissionListName + "')/Items";
var ListViewGroupListUrl = SPServerUrl + "_api/Web/Lists/getbytitle('" + ListViewGroupListName + "')/Items";
var pathArray = window.location.pathname.split("/");
var pageName = pathArray.pop().split(".").shift();
var listName = pathArray.pop();
var currentUserUrl = SPServerUrl + "_api/web/currentUser";
var currentUserGroupsUrl = SPServerUrl + "_api/web/GetUserById({0})/Groups";
var dataTableSelector = "#WebPartWPQ2 [summary]";

var headers = {
    "accept": "application/json;odata=verbose",
};

$(() => {
    $(dataTableSelector).hide();
});

async function main() {
    var ListViewGroupArray = await getCurrentListViewGroup();
    var UserGroupArray = await getCurrentUserGroups();
    var ViewPermissionArray = await getViewPermission();
    console.log(UserGroupArray);
    var isCurrentViewAllowed = ViewPermissionArray.findIndex(a => a.ViewName == pageName
        && ListViewGroupArray.includes(a.ListViewGroupName)
        && UserGroupArray.includes(a.UserGroupName));
    if (isCurrentViewAllowed >= 0) {
        $(dataTableSelector).show();
        return;
    }
    var allowedFirstView = ViewPermissionArray.find(a => ListViewGroupArray.includes(a.ListViewGroupName)
        && UserGroupArray.includes(a.UserGroupName));
    if (allowedFirstView != undefined) {
        window.location.replace(window.location.pathname.replace(pageName + ".aspx", allowedFirstView.ViewName + ".aspx"));
        return;
    }
    alert("You do not have permission to access this list.");
}

main();

function getCurrentListViewGroup() {
    var url = ListViewGroupListUrl + "/?$select=GroupName&$filter=ListName eq '" + listName + "'";
    return fetchJson(url)
        .then(d => {
            return d.results.map(a => a.GroupName);
        });
}

function getViewPermission() {
    var url = ViewPermissionListUrl + "/?$select=ViewName,ListViewGroupName,UserGroupName"
    return fetchJson(url)
        .then(d => {
            return d.results.map(a => {
                var b = {};
                b.ViewName = a.ViewName;
                b.ListViewGroupName = a.ListViewGroupName;
                b.UserGroupName = a.UserGroupName;
                return b;
            });
        });
}

function getCurrentUser() {
    return fetchJson(currentUserUrl)
        .then(d => {
            return d.Id;
        });
}

async function getCurrentUserGroups() {
    var UserId = await getCurrentUser();
    var url = currentUserGroupsUrl.replace("{0}", UserId);
    return fetchJson(url)
        .then(d => {
            return d.results.map(a => a.LoginName);
        });
}

function fetchJson(url) {
    return fetch(url, {
        credentials: 'same-origin',
        headers: headers
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data.d;
        });
}