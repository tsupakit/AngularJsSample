app.controller('documentController', function ($scope, documentService, dialog, toaster, $filter, ngTableParams) {

    $scope.deletedDocuments = [];
    $scope.selectedDocs = [];
    $scope.searchText = '';
    $scope.totalServerItems = 0;

    $scope.pagingOptions = {
        pageSizes: [10, 50, 100],
        pageSize: 100,
        currentPage: 1
    };

    $scope.setPagingData = function (data) {
        $scope.deletedDocuments = data.DeletedDocuments;
        $scope.totalServerItems = data.TotalDocuments;

        selectAll(false);
        $scope.selectedDocs = [];

        $scope.tableParams.reload();
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
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText);
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
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText);
                },
                function (error) {
                    console.log(error);
                    dialog.show(error.statusText, "Connection error");
                }
            );
        });

    };

    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal || newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, newVal.currentPage, $scope.searchText);
        }
    }, true);

    //------------ ngTable section -------------//
    $scope.tableParams = new ngTableParams({
        page: 1,
        //total: 1,  // value less than count hide pagination
        count: 100,
        sorting: {
            ArchivedDate: 'desc'
        }
    }, {
        counts: [], // hide page count control
        total: $scope.deletedDocuments.length,
        //data: $scope.deletedDocuments
        getData: function ($defer, params) {

            if (typeof $scope.deletedDocuments === 'undefined' || $scope.deletedDocuments.length === 0) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText);
            }

            var orderedData = params.sorting() ?
                                $filter('orderBy')($scope.deletedDocuments, params.orderBy()) :
                                $scope.deletedDocuments;

            params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve(orderedData);
        }

    });

    $scope.checkedDocuments = {};

    function selectAll(value) {
        angular.forEach($scope.deletedDocuments, function (item) {
            if (angular.isDefined(item.DocumentId)) {
                $scope.checkedDocuments[item.DocumentId] = value;
            }
        });
    }

    // watch for data checkboxes
    $scope.$watch('checkedDocuments', function (values) {
        if (!$scope.deletedDocuments) {
            return;
        }

        var selectedIds = Enumerable.From(values).Where("$.Value").Select("$.Key").ToArray();

        $scope.selectedDocs = Enumerable.From($scope.deletedDocuments)
                                        .Where(function (doc) { return selectedIds.indexOf(doc.DocumentId) > -1 })
                                        .ToArray();

    }, true);

    $scope.isSelected = function (id) {
        return Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.DocumentId === id });
    };
});