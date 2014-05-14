app.controller('documentController', function ($scope, documentService, toaster, dialog) {

    $scope.deletedDocuments = [];
    $scope.selectedDocs = [];    

    init();

    function init()
    {
        getDeletedDocuments();
    }

    function getDeletedDocuments()
    {
        documentService.getDeletedDocuments().then
        (
            function (results)
            {
                $scope.deletedDocuments = results.data;
                $scope.gridOptions.selectAll(false);
            },
            function (error)
            {
                alert(error.message);
            }
        );
    }

    function getSelectedIds()
    {
        var selectedIds = [];

        for (var index in $scope.selectedDocs)
        {
            selectedIds.push($scope.selectedDocs[index].DocumentId);
        }

        return selectedIds;
    }

    $scope.canRestore = function ()
    {
        return $scope.selectedDocs.length > 0;
    }

    $scope.canPurge = function () 
    {
        return $scope.selectedDocs.length > 0;
    }

    $scope.delete = function ()
    {
        if (Enumerable.From($scope.selectedDocs).All(function (doc) { return doc.IsProtecting }))
        {
            dialog.show("The documents selected can not be deleted as they are protected and are still within the protection period.", "Unable to delete", alertView);
            return;
        }

        var confirmMessage = 'Are you sure you want to permanently delete the selected document(s)? Once deleted, these can not be restored.';

        if (Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.IsProtecting }))
        {
            confirmMessage = 'At least one of the documents selected is a protected document and is still within the protection period therefore can not be deleted. Would you like to continue to permanently delete the other document(s)? Once deleted, these can not be restored.';
        }

        dialog.show(confirmMessage, "Permanently Delete", confirmView).then(function () {
            var selectedIds = Enumerable.From($scope.selectedDocs)
                                        .Where(function (doc) { return !doc.IsProtecting })
                                        .Select(function (doc) { return doc.DocumentId }).ToArray(); //getSelectedIds();

            documentService.deleteDocuments(selectedIds).then(getDeletedDocuments);
        });
        
    };

    $scope.restore = function ()
    {
        var confirmMessage = 'Are you sure you want to restore the selected document(s)? This action will re-archive the document(s) and make them available in your host system.';

        dialog.show(confirmMessage, "Restore Document", confirmView).then(function () {
            var selectedIds = getSelectedIds();

            documentService.restoreDocument(selectedIds).then(getDeletedDocuments);
        });
        
    };

    //------ ngGrid section ------//

    var dateCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date: "' + dateFormat + '"}}</span></div>';

    $scope.gridOptions = {
        data: 'deletedDocuments',
        selectedItems: $scope.selectedDocs, 
        keepLastSelected: false, 
        //rowTemplate: '<div style="height: 100%" ng-class="{green: row.getProperty(\'IsProtected\') == true}">' + 
        //                '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell ">' +
        //                   '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div>' +
        //                   '<div ng-cell></div>' +
        //                '</div>' +
        //             '</div>',
        columnDefs: [{ field: 'DocumentName', displayName: 'Document Name' },
                     { field: 'DocumentType', displayName: 'Document Type' },
                     { field: 'DocumentDate', displayName: 'Document Date', cellTemplate: dateCellTemplate },
                     { field: 'ArchivedBy', displayName: 'Archived By' },
                     { field: 'DeletedDate', displayName: 'Deleted Date', cellTemplate: dateCellTemplate },
                     { field: 'DeletedBy', displayName: 'Deleted By' },
                     { field: 'IsProtected', displayName: 'Protected', width: 80, resizable: true, cellTemplate: '<div class="ngCellText text-center" ng-class="col.colIndex()" ng-show="row.entity[col.field]"><span ng-cell-text class="glyphicon glyphicon-ok" /></div>' },
                     { field: 'ProtectionStartDate', displayName: 'Protection Start', cellTemplate: dateCellTemplate },
                     { field: 'ProtectionEndDate', displayName: 'Protection End', cellTemplate: dateCellTemplate }]
    };    

});