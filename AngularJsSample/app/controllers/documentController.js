app.controller('documentController', ['$scope', 'documentService', 'dialog', '$filter', 'ngTableParams', '$locale',
    function ($scope, documentService, dialog, $filter, ngTableParams, $locale) {

        //var messages = {
        //    'NoDeletedDocuments': 'No deleted documents found.',
        //    'NoMatchingSearch': 'No deleted documents found matching your search criteria.',
        //    'CannotDelete': 'The document(s) selected cannot be deleted as they are protected and are still within the protection period.',
        //    'ConfirmDelete': 'Are you sure you want to permanently delete the selected document(s)? Once deleted, these cannot be restored.',
        //    'ConfirmDeleteWithProtected': 'At least one of the document(s) selected is a protected document and is still within the protection period therefore cannot be deleted. Would you like to continue to permanently delete the other document(s)? Once deleted, these cannot be restored.',
        //    'ConfirmRestore': 'Are you sure you want to restore the selected document(s)? This action will re-archive the document(s) and make them available for viewing.',
        //    'InexistDocuments': 'Selected document(s) does not exist',
        //    'GoDeleteButton': 'Yes, permanently delete the selected document(s)',
        //    'GoRestoreButton': 'Yes, restore the selected document(s)'
        //};

        $scope.deletedDocuments = [];
        $scope.checkedDocuments = {};
        $scope.selectedDocs = [];
        $scope.searchText = '';
        $scope.notfoundText = '';
        $scope.totalServerItems = 0;
        $scope.cache = {};

        toastr.options = {
            positionClass: 'toast-bottom-full-width',
            showDuration: "50000",
            hideDuration: "1000",
            timeOut: "5000", //display duration
            extendedTimeOut: "3000", //display duration after hover
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: 'slideDown',
            hideMethod: 'slideUp',
            closeButton: true,
            newestOnTop: false
        }

        $locale.DATETIME_FORMATS.shortDate = $.shortDateFormat;

        $scope.pagingOptions = {
            pageSizes: [10, 50, 100],
            pageSize: 100,
            currentPage: 1
        };

        $scope.reload = function () {
            $scope.cache = {};
            $scope.tableParams.reload();
        }

        $scope.showMetadata = function (data) {
            dialog.showMetadata(data);
        };

        $scope.search = function () {
            $scope.reload();
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

        function getDocument(source, id) {
            var document = Enumerable.From(source).First(function (doc) { return doc.DocumentId === id; });

            return document;
        }

        $scope.purge = function () {
            if (Enumerable.From($scope.selectedDocs).All(function (doc) { return doc.IsProtected; })) {
                dialog.information(messages.CannotDelete, "Unable to Delete");
                return;
            }

            var confirmMessage = messages.ConfirmDelete;

            if (Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.IsProtected; })) {
                confirmMessage = messages.ConfirmDeleteWithProtected;
            }

            dialog.confirm(confirmMessage, "Permanently Delete", messages.GoDeleteButton).then(function () {
                var selectedIds = Enumerable.From($scope.selectedDocs)
                    .Where(function (doc) { return !doc.IsProtected; })
                    .Select(function (doc) { return doc.DocumentId; }).ToArray();

                documentService.purgeDocuments(selectedIds).then(function (results) {

                    if (results == 0) {
                        dialog.alert(messages.InexistDocuments, 'Operation Incomplete');
                    } else {
                        var message = 'Successfully deleted ';

                        if (results > 1)
                            message += results + ' documents';
                        else if (results == 1)
                            message += getDocument($scope.selectedDocs, selectedIds[0]).DocumentName;

                        toastr.info(message);
                    }

                    $scope.reload();

                }).fail(dialog.error);
            });
        };

        $scope.restore = function () {
            var confirmMessage = messages.ConfirmRestore;

            dialog.confirm(confirmMessage, "Restore Document", messages.GoRestoreButton).then(function () {
                var selectedIds = Enumerable.From($scope.selectedDocs)
                    .Select(function (doc) { return doc.DocumentId; }).ToArray();

                documentService.restoreDocuments(selectedIds).then(function (results) {

                    if (results == 0) {
                        dialog.alert(messages.InexistDocuments, 'Operation Incomplete');
                    } else {
                        var message = 'Successfully restored ';

                        if (results > 1)
                            message += results + ' documents';
                        else if (results == 1)
                            message += getDocument($scope.selectedDocs, selectedIds[0]).DocumentName;

                        toastr.info(message);
                    }

                    $scope.reload();

                }).fail(dialog.error);
            });
        };

        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal || newVal.currentPage !== oldVal.currentPage) {
                $scope.reload();
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
                updateData = function ($defer, params) {
                    var orderedData = params.sorting() ?
                        $filter('orderBy')($scope.deletedDocuments, params.orderBy()) :
                        $scope.deletedDocuments;

                    params.total(orderedData.length); // set total for recalc pagination
                    $defer.resolve(orderedData);

                    if (orderedData.length === 0) {
                        $scope.notfoundText = messages.NoDeletedDocuments;

                        if ($scope.searchText !== '')
                            $scope.notfoundText = messages.NoMatchingSearch;

                        //$scope.notfoundText += ".";
                    }
                }

                if ($scope.cache.pageSize != $scope.pagingOptions.pageSize || 
                    $scope.cache.currentPage != $scope.pagingOptions.currentPage || 
                    $scope.cache.searchText != $scope.searchText) {
                    documentService.getDeletedDocuments($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.searchText)
                        .then(function (data) {
                            $scope.cache.pageSize = $scope.pagingOptions.pageSize;
                            $scope.cache.currentPage = $scope.pagingOptions.currentPage;
                            $scope.cache.searchText = $scope.searchText;

                            $scope.deletedDocuments = data.DeletedDocuments;
                            $scope.totalServerItems = data.TotalDocuments;

                            selectAll(false);
                            $scope.selectedDocs = [];

                            updateData($defer, params);
                        }).fail(function (message) {
                            //$scope.notfoundText = message;
                            dialog.error(message).then(function () {
                                javaScriptBoundObject.Cancel();
                            });
                        });
                } else updateData($defer, params);
            }
        });

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
                .Where(function (doc) { return selectedIds.indexOf(doc.DocumentId) > -1; })
                .ToArray();

        }, true);

        $scope.isSelected = function (id) {
            return Enumerable.From($scope.selectedDocs).Any(function (doc) { return doc.DocumentId === id; });
        };

        //$scope.utcDate = function(date) {
        //    var _utc = new Date(date.getFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        //    return _utc;
        //}
    }]);
