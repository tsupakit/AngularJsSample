var app = angular.module('SdcApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'toaster', 'chieffancypants.loadingBar', 'ngGrid']);

app.config(function ($routeProvider)
{

    $routeProvider.when("/deleted", {
        controller: "documentController",
        templateUrl: "/app/views/deleted.html"
    });

    $routeProvider.otherwise({ redirectTo: "/deleted" });

});

var alertView = '/app/views/dialog/alert.html';
var confirmView = '/app/views/dialog/confirm.html';
var dateFormat = 'dd/MM/yyyy HH:mm:ss Z';