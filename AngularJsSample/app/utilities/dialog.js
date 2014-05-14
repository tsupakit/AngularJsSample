app.factory('dialog', function ($modal)
{
    function show(message, title, viewTemplate) {
        var modal = $modal.open({
            templateUrl: viewTemplate, //'/app/views/dialog/confirm.html',
            controller: 'dialogController', 
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Dialog',
                        message: message
                    };
                }
            }            
        });

        return modal.result;
    }

    return {
        show: show
    };

});