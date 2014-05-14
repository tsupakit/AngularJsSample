'use strict';
app.factory('documentService', function ($http, toaster) {

    var serviceBase = "/api/documents/";
    var purgeAction = "purge";
    var restoreAction = "restore";

    var documentFactory = {};

    var _getDeletedDocuments = function ()
    {
        return $http.get(serviceBase).then(function (results)
        {
            return results;
        });
    };

    var _deleteDocuments = function (ids)
    {
        return $http.post(serviceBase + purgeAction, ids).success( 
            function (results)
            {
                toaster.pop('success', "Deleted Successfully", results + " documents have been purged");
            }
        )
    };

    var _restoreDocuments = function (ids)
    {
        return $http.post(serviceBase + restoreAction, ids).success( 
            function (results)
            {
                toaster.pop('success', "Restored Successfully", results + " documents have been restored");
            }
        )
    };

    documentFactory.getDeletedDocuments = _getDeletedDocuments;
    documentFactory.deleteDocuments = _deleteDocuments;
    documentFactory.restoreDocument = _restoreDocuments;

    return documentFactory;
});