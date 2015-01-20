app.factory('dialog', ['$modal', function ($modal)
{
    function showMetadata(document) {
        var modal = $modal.open({
            templateUrl: metadataView, 
            controller: 'dialogController', 
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        document: document
                    };
                }
            }

        });

        return modal.result;
    };    

    function confirm(message, title, okMessage) {
        var modal = $modal.open({
            templateUrl: dialogView, 
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Confirm Dialog',
                        icon: 'icon-information',
                        message: message,
                        isConfirmation: true,
                        okMessage: okMessage ? okMessage : 'Yes'
                    };
                }
            }

        });

        return modal.result;
    };

    function alert(message, title) {
        var modal = $modal.open({
            templateUrl: dialogView, 
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Dialog',
                        icon: 'icon-warning',
                        message: message,
                        isConfirmation: false,
                        okMessage: 'OK'
                    };
                }
            }

        });

        return modal.result;
    };

    function information(message, title) {
        var modal = $modal.open({
            templateUrl: dialogView, 
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Dialog',
                        icon: 'icon-information',
                        message: message,
                        isConfirmation: false,
                        okMessage: 'OK'
                    };
                }
            }

        });

        return modal.result;
    };

    function error(message, title) {
        var modal = $modal.open({
            templateUrl: dialogView, 
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Operation Failed',
                        icon: 'icon-close',
                        message: message,
                        isConfirmation: false,
                        okMessage: 'OK'
                    };
                }
            }

        });

        return modal.result;
    };

    return {
        showMetadata: showMetadata,
        confirm : confirm, 
        alert: alert,
        information: information,
        error: error
    };

}]);