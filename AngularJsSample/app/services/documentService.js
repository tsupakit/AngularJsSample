'use strict';
app.factory('documentService', function ($http) {

    var serviceBase = "/api/documents/";
    var purgeAction = "purge";
    var restoreAction = "restore";

    return {

        getDeletedDocuments: function (pageSize, page, search) {
            //return $http.get(serviceBase + "deleted/" + pageSize + "/" + page + "/" + search);
            var request = JSON.stringify({ PageSize: pageSize, Page: page, Query: search });
            return $http.post(serviceBase + "deleted/", request);
        },
        purgeDocuments: function (ids) {
            return $http.post(serviceBase + purgeAction, ids);
        },
        restoreDocuments: function (ids) {
            return $http.post(serviceBase + restoreAction, ids);
        }
    }
});