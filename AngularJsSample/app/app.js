var app = angular.module('SdcApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'toaster', 'chieffancypants.loadingBar', 'ngGrid', 'ngTable']);

app.config(function ($routeProvider) {

    $routeProvider.when("/deleted", {
        controller: "documentController",
        templateUrl: "/app/views/deleted.html"
    });

    $routeProvider.otherwise({ redirectTo: "/deleted" });

});

//var alertView = '/app/views/dialog/alert.html';
//var confirmView = '/app/views/dialog/confirm.html';
var metadataView = '/app/views/dialog/metadata.html';
var dialogView = '/app/views/dialog/dialog.html';
var dateFormat = 'dd/MM/yyyy HH:mm:ss';