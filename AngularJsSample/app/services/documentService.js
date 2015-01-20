'use strict';
app.factory('documentService', ['$http', '$resource', function ($http, $resource) {

    var serviceBase = "/api/documents/";
    var purgeAction = "purge";
    var restoreAction = "restore";

    //var Document = serviceHelper.Document;

    return {
        getDeletedDocuments: function (pageSize, page, search) {
            var defer = $.Deferred();

            var request = JSON.stringify({
                PageSize: pageSize,
                Page: page,
                Query: search,
                // SitthidateTODO: Add time zone
                // TimeZoneName: $.timeZone,
                CultureInfoName: $.culture,
                ShortDateFormat: $.shortDateFormat
            });

            //Document.getDeletedDocuments(request).$promise.then(function (response) {
            //    defer.resolve(response);
            //})
            //["catch"](function (error) {
            //    defer.reject(error.statusText);
            //});

            $http.post(serviceBase + "deleted/", request)
                .then(function (response) {
                    defer.resolve(response.data);
                })
                ["catch"](function (error) {
                    defer.reject(error.statusText);
                });
            return defer.promise();

        },
        purgeDocuments: function (ids) {
            var defer = $.Deferred();

            //Document.purge(ids).$promise.then(function (response) {
            //    defer.resolve(response);
            //})
            //["catch"](function (error) {
            //    defer.reject(error.statusText);
            //});

            $http.post(serviceBase + purgeAction, ids)
                .then(function (response) {
                    defer.resolve(response.data);
                })
                ["catch"](function (error) {
                    defer.reject(error.statusText);
                });
            return defer.promise();
        },
        restoreDocuments: function (ids) {
            var defer = $.Deferred();

            $http.post(serviceBase + restoreAction, ids)
                .then(function (response) {
                    defer.resolve(response.data);
                })
                ["catch"](function (error) {
                    defer.reject(error.statusText);
                });
            return defer.promise();
        }
    }
}]);