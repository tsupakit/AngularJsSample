'use strict';
app.factory('documentService', function ($http) {

    var serviceBase = "/api/documents/";
    var purgeAction = "purge";
    var restoreAction = "restore";

    return {

        getDeletedDocuments: function (pageSize, page) {
            return $http.get(serviceBase + "deleted/" + pageSize + "/" + page);
        },
        purgeDocuments: function (ids) {
            return $http.post(serviceBase + purgeAction, ids);
        },
        restoreDocuments: function (ids) {
            return $http.post(serviceBase + restoreAction, ids);
        }
    }
});