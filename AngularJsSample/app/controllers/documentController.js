app.controller('documentController', function ($scope, documentService, dialog, toaster) {

    $scope.deletedDocuments = [];
    $scope.selectedDocs = [];

    $scope.showMetadata = function (metadata) {
        dialog.showMetadata(metadata);
    };

    $scope.search = function () {
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText);
    };

    $scope.reset = function () {
        $scope.searchText = '';
        $scope.pagingOptions.currentPage = 1;

        $scope.search();
    };

    $scope.canRestore = function () {
        return $scope.selectedDocs.length > 0;
    };

    $scope.canPurge = function () {
        return $scope.selectedDocs.length > 0;
    };

    $scope.purge = function () {
        if (Enumerable.From($scope.selectedDocs).All(function (doc) { return doc.IsProtected })) {
            dialog.show("The documents selected can not be deleted as they are protected and are still within the protection period.", "Unable to delete");
            return;
        }

        var confirmMessage = 'Are you sure you want to permanently delete the selected document(s)? Once deleted, these can not be restored.';

        if (Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.IsProtected })) {
            confirmMessage = 'At least one of the documents selected is a protected document and is still within the protection period therefore can not be deleted. Would you like to continue to permanently delete the other document(s)? Once deleted, these can not be restored.';
        }

        dialog.confirm(confirmMessage, "Permanently Delete", 'Yes, permanently delete the selected documents').then(function () {
            var selectedIds = Enumerable.From($scope.selectedDocs)
                                        .Where(function (doc) { return !doc.IsProtected })
                                        .Select(function (doc) { return doc.DocumentId }).ToArray(); //getSelectedIds();

            documentService.purgeDocuments(selectedIds).then
            (
                function (results) {
                    toaster.pop('success', "Deleted Successfully", results.data + " documents have been purged");
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                },
                function (error) {
                    console.log(error);
                    dialog.show(error.statusText, "Connection error");
                }
            );
        });

    };

    $scope.restore = function () {
        var confirmMessage = 'Are you sure you want to restore the selected document(s)? This action will re-archive the document(s) and make them available for viewing.';

        dialog.confirm(confirmMessage, "Restore Document", 'Yes, restore the selected documents').then(function () {
            var selectedIds = Enumerable.From($scope.selectedDocs)
                                        .Select(function (doc) { return doc.DocumentId }).ToArray();

            documentService.restoreDocuments(selectedIds).then
            (
                function (results) {
                    toaster.pop('success', "Restored Successfully", results.data + " documents have been restored");
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                },
                function (error) {
                    console.log(error);
                    dialog.show(error.statusText, "Connection error");
                }
            );
        });

    };

    //------ ngGrid section ------//
    $scope.totalServerItems = 0;

    //$scope.selectAll = function (selectedValue) {
    //    $scope.gridOptions.selectVisible(selectedValue);

    //    $scope.isSelectAll = selectedValue;
    //};

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

    //$scope.filterOptions = {
    //    filterText: $scope.filterText
    //};

    $scope.searchText = '';

    $scope.pagingOptions = {
        pageSizes: [10, 50, 100],
        pageSize: 100,
        currentPage: 1
    };

    $scope.setPagingData = function (data) {
        //var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.deletedDocuments = data.DeletedDocuments;
        $scope.totalServerItems = data.TotalDocuments;

        $scope.gridOptions.selectAll(false);

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {

            documentService.getDeletedDocuments(pageSize, page, searchText)
                .then(function (results) {

                    $scope.setPagingData(results.data);

                })
                ["catch"](function (error) {

                    console.log("An error occured: " + error);
                    dialog.show(error.statusText, "Connection error");

                });

        }, 500);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText);

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal || newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, newVal.currentPage, $scope.searchText);
        }
    }, true);
    //$scope.$watch('filterOptions', function (newVal, oldVal) {
    //    if (newVal !== oldVal) {
    //        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    //    }
    //}, true);            

    //$scope.$watch('filterText', function (newText) {
    //    $scope.gridOptions.filterOptions.filterText = newText;

    //    $scope.selectAll(false);
    //    //myplugin.grid.searchProvider.evalFilter();
    //});

    var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}">' +
                            '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div>' +
                            '<div ng-cell></div>' +
                      '</div>';


    var dateCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date: "' + dateFormat + '"}}</span></div>';
    //var periodEndCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.getProperty(col.field) | date: "dd/MM/yyyy"}}</span></div>';
    //var iconCellTemplate = '<div class="ngCellText text-center" ng-class="col.colIndex()" ng-show="row.entity[col.field]"><span title="Protected" ng-cell-text class="glyphicon glyphicon-ok" /></div>';
    var protectedCellTemplate = '<div class="ngCellText text-center" ng-class="col.colIndex()" ng-show="row.entity[col.field]"><span popover="Protected {{row.entityProtectionInfo}}" popover-trigger="mouseenter" tooltip="Protected {{row.entity.ProtectionInfo}}" title="Protected {{row.entity.ProtectionInfo}}" ng-cell-text class="glyphicon glyphicon-lock" /></div>';
    var metadataCellTemplate = '<div class="ngCellText text-center" ng-class="col.colIndex()"><span ng-cell-text class="glyphicon glyphicon-list-alt" ng-click="showMetadata(row.entity[col.field])" title="Metadata" /></div>';

    $scope.gridOptions = {
        data: 'deletedDocuments',
        selectedItems: $scope.selectedDocs,
        //enableRowSelection: false,
        showSelectionCheckbox: true,
        selectWithCheckboxOnly: true,
        maintainColumnRatios: true,
        enableHighlighting: false,
        enableColumnResize: true,
        enablePaging: true,
        showFooter: false,
        //keepLastSelected: false,
        //filterOptions: $scope.filterOptions,        
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        //rowTemplate: rowTemplate, 
        afterSelectionChange: function (data) {
            $scope.isSelectAll = $scope.selectedDocs.length == $scope.gridOptions.$gridScope.totalFilteredItemsLength();
        },
        columnDefs: [{ field: 'IsProtected', displayName: '', width: '3%', cellTemplate: protectedCellTemplate, sortable: false, resizable: false },
                     { field: 'MetadataItems', displayName: '', width: '3%', cellTemplate: metadataCellTemplate, sortable: false, resizable: false },
                     { field: 'DocumentName', displayName: 'Document Name' },
                     { field: 'DocumentType', displayName: 'Document Type' },
                     { field: 'ArchivedDate', displayName: 'Archived Date', cellTemplate: dateCellTemplate },
                     //{ field: 'ArchivedBy', displayName: 'Archived By' },
                     { field: 'DeletedDate', displayName: 'Deleted Date', cellTemplate: dateCellTemplate },
                     { field: 'DeletedBy', displayName: 'Deleted By' },
                     //{ field: 'IsProtected', displayName: 'Protected', width: '6%', cellTemplate: iconCellTemplate }, //, sortFn: function (a, b) { } },
                     //{ field: 'ProtectionPeriod', displayName: 'Protection Period', cellTemplate: dateCellTemplate },
                     //{ field: 'ProtectionEndDate', displayName: 'Protection End', cellTemplate: periodEndCellTemplate }
        ]
        , checkboxHeaderTemplate: '<br />'
    };

});