var app = angular.module('SdcApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'angular-loading-bar', 'ngTable', 'acute.select']);

app.config([
    '$routeProvider', function ($routeProvider) {

        $routeProvider.when("/index", {
            templateUrl: "/app/views/index.html"
        });

        $routeProvider.when("/deleted", {
            controller: "documentController",
            templateUrl: "/app/views/deleted.html"
        });

        $routeProvider.when("/documentSecurity", {
            controller: "userPermissionController",
            templateUrl: "/app/views/users/documentTypesPermission.html"
        });

        $routeProvider.otherwise({ redirectTo: "/index" });
    }
]);

var metadataView = '/app/views/dialog/metadata.html';
var dialogView = '/app/views/dialog/dialog.html';
