app.controller('documentController', function ($scope, documentService, dialog) {

    $scope.deletedDocuments = [];
    $scope.selectedDocs = [];

    init();

    function init() {
        getDeletedDocuments();
    }

    function getDeletedDocuments() {
        documentService.getDeletedDocuments().then
        (
            function (results) {
                $scope.deletedDocuments = results.data;
                $scope.gridOptions.selectAll(false);
            },
            function (error) {
                alert(error.message);
            }
        );
    }

    function getSelectedIds() {
        var selectedIds = [];

        for (var index in $scope.selectedDocs) {
            selectedIds.push($scope.selectedDocs[index].DocumentId);
        }

        return selectedIds;
    }

    $scope.canRestore = function () {
        return $scope.selectedDocs.length > 0;
    }

    $scope.canPurge = function () {
        return $scope.selectedDocs.length > 0;
    }

    $scope.delete = function () {
        if (Enumerable.From($scope.selectedDocs).All(function (doc) { return doc.IsProtected })) {
            dialog.show("The documents selected can not be deleted as they are protected and are still within the protection period.", "Unable to delete", alertView);
            return;
        }

        var confirmMessage = 'Are you sure you want to permanently delete the selected document(s)? Once deleted, these can not be restored.';

        if (Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.IsProtected })) {
            confirmMessage = 'At least one of the documents selected is a protected document and is still within the protection period therefore can not be deleted. Would you like to continue to permanently delete the other document(s)? Once deleted, these can not be restored.';
        }

        dialog.show(confirmMessage, "Permanently Delete", confirmView).then(function () {
            var selectedIds = Enumerable.From($scope.selectedDocs)
                                        .Where(function (doc) { return !doc.IsProtected })
                                        .Select(function (doc) { return doc.DocumentId }).ToArray(); //getSelectedIds();

            documentService.deleteDocuments(selectedIds).then(getDeletedDocuments);
        });

    };

    $scope.restore = function () {
        var confirmMessage = 'Are you sure you want to restore the selected document(s)? This action will re-archive the document(s) and make them available for viewing.';

        dialog.show(confirmMessage, "Restore Document", confirmView).then(function () {
            var selectedIds = getSelectedIds();

            documentService.restoreDocument(selectedIds).then(getDeletedDocuments);
        });

    };

    //------ ngGrid section ------//
    $scope.documentType = 'All';
    $scope.filterText = '';
    $scope.selectAll = false;

    //$scope.pagingOptions = {
    //    pageSizes: [5, 10, 20],
    //    pageSize: 5,
    //    currentPage: 1
    //};

    $scope.$watch('selectAll', function (selectedValue) {
        $scope.gridOptions.selectVisible(selectedValue);
    });

    //$scope.$watch('documentType', function (selectedType) {
    //    var filteredRows = $scope.deletedDocuments;

    //    var result = [];

    //    if (selectedType == 'All') {
    //        result = $scope.deletedDocuments;
    //    }
    //    else if (selectedType == 'Unprotected') {
    //        result = Enumerable.From(filteredRows).Where(function (doc) { return !doc.IsProtected }).ToArray();            
    //    }
    //    else if (selectedType == 'Protected') {
    //        result = Enumerable.From(filteredRows).Where(function (doc) { return doc.IsProtected }).ToArray();
    //    }

    //    $scope.gridOptions.data = result;
    //});

    $scope.$watch('filterText', function (newText) {
        $scope.gridOptions.filterOptions.filterText = newText;
        //myplugin.grid.searchProvider.evalFilter();
    });

    var dateCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date: "' + dateFormat + '"}}</span></div>';
    var iconCellTemplate = '<div class="ngCellText text-center" ng-class="col.colIndex()" ng-show="row.entity[col.field]"><span title="Protected" ng-cell-text class="glyphicon glyphicon-ok" /></div>';

    $scope.gridOptions = {
        data: 'deletedDocuments',
        selectedItems: $scope.selectedDocs,
        enableColumnResize: true,
        //keepLastSelected: false,        
        showFooter: true,
        //showFilter: true,
        filterOptions: {
            filterText: $scope.filterText
        },
        //enablePaging: true,
        //pagingOptions: $scope.pagingOptions,
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
                     { field: 'IsProtected', displayName: 'Protected', width: '6%', cellTemplate: iconCellTemplate },
                     { field: 'ProtectionStartDate', displayName: 'Protection Period', cellTemplate: dateCellTemplate },
                     { field: 'ProtectionEndDate', displayName: 'Protection End', cellTemplate: dateCellTemplate }]
    };

});