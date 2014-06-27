app.factory('dialog', function ($modal) {
    function showMetadata(metadata) {
        var modal = $modal.open({
            templateUrl: metadataView, //'/app/views/dialog/confirm.html',
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        metadata: metadata
                    };
                }
            }

        });

        return modal.result;
    };

    function show(message, title) {
        var modal = $modal.open({
            templateUrl: dialogView, //'/app/views/dialog/confirm.html',
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Dialog',
                        message: message,
                        isConfirmation: false,
                        okMessage: 'OK'
                    };
                }
            }

        });

        return modal.result;
    };

    function confirm(message, title, okMessage) {
        var modal = $modal.open({
            templateUrl: dialogView, //'/app/views/dialog/confirm.html',
            controller: 'dialogController',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Confirm Dialog',
                        message: message,
                        isConfirmation: true,
                        okMessage: okMessage ? okMessage : 'Yes'
                    };
                }
            }

        });

        return modal.result;
    };

    return {
        showMetadata: showMetadata,
        show: show,
        confirm: confirm
    };

});