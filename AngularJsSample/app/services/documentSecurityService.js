'use strict';
app.factory('documentSecurityService', ['$http',
    function ($http) {

        var serviceBase = "/api/documentSecurity/";
        var getUsersAction = "getUsers/";
        var metadataTemplatesAction = "metadataTemplates/";
        var metadataTemplatesByuserAction = "metadataTemplatesByUser/"; 
        var saveMetadataTemplatesPermissionAction = "saveMetadataTemplatesPermission/";

        return {
            getUsers: function () {
                var deferred = $.Deferred();
                $http.get(serviceBase + getUsersAction)
                    .then(function (results) {
                        deferred.resolve(results.data);
                    })["catch"](function (error) {
                        deferred.reject(error.statusText);
                    });;
                return deferred.promise();
            },

            getMetadataTemplates: function () {
                console.log('Service: getMetadataTemplates');
                var deferred = $.Deferred();
                $http.get(serviceBase + metadataTemplatesAction)
                .then(function (results) {
                    deferred.resolve(results.data);
                })["catch"](function (error) {
                    deferred.reject(error.statusText);
                });;
                return deferred.promise();
            },

            getMetadataTemplatesByUser: function (userId) {
                console.log('Service: getMetadataTemplatesByUser   user:' + userId);
                var deferred = $.Deferred();
                var request = userId;
                $http.get(serviceBase + metadataTemplatesByuserAction + request)
                .then(function (results) {
                    deferred.resolve(results.data);
                })["catch"](function (error) {
                    deferred.reject(error.statusText);
                });;
                return deferred.promise();
            },
         
            saveMetadataTemplatesPermission: function (userId, canViewList) {
                console.log('Service: saveMetadataTemplatesPermission   user:' + userId);
                var defer = $.Deferred();

                var request = { UserId: userId, CanViewList: canViewList };

                $http.post(serviceBase + saveMetadataTemplatesPermissionAction, request)
                    .then(function (results) {
                        defer.resolve(results.data);
                    })["catch"](function (error) {
                        defer.reject(error.statusText);
                    });;

                return defer.promise();
            },
        };
    }
]);