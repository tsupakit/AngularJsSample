app.controller('userPermissionController', [
        '$scope', 'documentSecurityService', 'dialog', '$filter', 'ngTableParams', '$timeout', '$compile',
    function($scope, documentSecurityService, dialog, $filter, ngTableParams, $timeout, $compile) {
        var allTypes = 'allTypes';
        var captureOnly = 'captureOnly';
        var specific = 'specific';
        var specificAndCapture = 'specificAndCapture';

        var messages = {
            'Unsaved': 'Unsaved changes were detected. Would you like to save these changes before closing?',
            'UnsavedTitle': 'Unsaved Changes',
            'SaveSuccessfully': 'Successfully changed the Document Type permissions for {0} user{1}.',
            'NeedAtLeastOneDocument': 'You must select at least one Document Type or change the selected permissions before you can save your changes.',
            'NeedAtLeastOneDocument_userChange': 'You must select at least one Document Type or change the selected permissions before you can change users.',
            'NeedAtLeastOneDocument_userChange_title': 'Document Type Not Selected',
        };

        var permissionGroupMessages = [
            {
                text: 'All Document Types',
                value: allTypes
            },
            {
                text: 'Documents captured by them only',
                value: captureOnly
            },
            {
                text: 'Specific Document Types only',
                value: specific
            },
            {
                text: 'Specific Document Types & Documents captured by them',
                value: specificAndCapture
            }
        ];

        $scope.ALL_NAME = "AllValues";
        $scope.MY_CAPTURES = "AllMyCaptures";
        $scope.dataList = null;
        $scope.userList = null;
        $scope.selectUserId = null;
        $scope.oldSelectUserId = null;
        $scope.dataListUserId = null;
        $scope.allDataOption = {};
        $scope.myCaptureOption = {};
        $scope.searchText = '';
        $scope.dirty = false; // True, If select user is dirty.
        $scope.haveDirty = false; // True, If some user are dirty.
        $scope.permissionGroup = null;
        $scope.gridDisabled = true;
        $scope.inProgress = false;
        var cache = $.Deferred();

        toastr.options = {
            positionClass: 'toast-bottom-full-width',
            showDuration: "50000",
            hideDuration: "1000",
            timeOut: "5000", //display duration
            extendedTimeOut: "3000", //display duration after hover
            showEasing: "linear",
            hideEasing: "linear",
            showMethod: 'slideDown',
            hideMethod: 'slideUp',
            closeButton: true,
            newestOnTop: false
        }

        var ignorableWatch = function(watchExp, listener) {
            var deregisterWatch = null;

            var start = function() {
                deregisterWatch = $scope.$watch(watchExp, listener);
            };
            start();

            return {
                ignore: function(callback) {
                    deregisterWatch();
                    callback();
                    start();
                }
            };
        };

        $scope.isGridDisabled = function() {
            return $scope.gridDisabled || $scope.inProgress;
        }


        /*
        In the PERMISSION drop-down we need the following options:
        •	View all documents (All Document Types)
            Note – this is the default option. 
            If this option is selected, 
            the grid below it should be disabled.

        •	View documents the user captures only
            Note – If this option is selected, 
            the grid below it should be disabled.

        •	View documents of specific Document Types only
            Note – If this option is selected, 
            the grid below it should be enabled. 
            The user must select at least one Document Type from the grid before they can save. 

        •	View documents of specific Document Types and all documents the user captures
            Note – If this option is selected, 
            the grid below it should be enabled. 
            The user must select at least one Document Type from the grid before they can save.
         */

        $scope.permissionGroupLists = function(callback) {
            $scope.permissionGroupLists_callback = callback;
        }

        var loadPermissionGroupList = function() {
            if ($scope.permissionGroupLists_callback != null)
                $scope.permissionGroupLists_callback(permissionGroupMessages);
        }

        var permissionGroupWatch = ignorableWatch('permissionGroup', function(newVal, oldVal) { 
            if (newVal == oldVal) return;
            if ($scope.userList == null || $scope.userList.length == 0) return;
            onPermissionGroupUpdate(newVal, oldVal, true);
        }, true);

        var onPermissionGroupUpdate = function (newVal, oldVal) {
                // oldValue = null  supply when change user.

            var updateAllCanViewable = null;
            $scope.allDataOption.oldCanViewable = $scope.allDataOption.CanViewable;
            $scope.myCaptureOption.oldCanViewable = $scope.myCaptureOption.CanViewable;
            console.log("On can view dropdown changed from " + oldVal + " to " +newVal);
            switch (newVal) {
            case allTypes:
                $scope.gridDisabled = true;
                $scope.specificDocumentTypes = false;
                $scope.myCaptureOption.CanViewable = false;
                updateAllCanViewable = true;
                break;

            case captureOnly:
                $scope.gridDisabled = true;
                $scope.specificDocumentTypes = false;
                $scope.myCaptureOption.CanViewable = true;
                updateAllCanViewable = false;
                break;

            case specific:
                $scope.gridDisabled = false;
                $scope.myCaptureOption.CanViewable = false;
                $scope.specificDocumentTypes = true;
                // clear when thick by all document types selected, otherwise remain old stage.
                if (oldVal === allTypes) {
                    updateAllCanViewable = false;
                }
                break;

            case specificAndCapture:
                $scope.gridDisabled = false;
                $scope.myCaptureOption.CanViewable = true;
                $scope.specificDocumentTypes = true;
                // clear when thick by all document types selected, otherwise remain old stage.
                if (oldVal === allTypes) {
                    updateAllCanViewable = false;
                }
                break;

            default:
            }

            // set / reset CanViewable for all template
            var canViewChanged = false;
            if (updateAllCanViewable != null) {
                $scope.allDataOption.CanViewable = updateAllCanViewable;

                angular.forEach($scope.dataList, function (x) {
                    if (x.CanViewable !== updateAllCanViewable) canViewChanged = true;
                    x.CanViewable = updateAllCanViewable;
                });
            }

            // detect dirty change
            if (($scope.allDataOption.oldCanViewable !== $scope.allDataOption.CanViewable)
                || ($scope.myCaptureOption.oldCanViewable !== $scope.myCaptureOption.CanViewable)
                || canViewChanged) {

                if (oldVal !== null) // oldVal == null occur when changed user, should make sure that it not set to dirty.
                    $scope.haveDirty = $scope.dirty = true;
            }
        };

        var selectUserIdWatch = ignorableWatch('selectUserId', function(newVal, oldVal) {
            if (newVal === oldVal) return;

            if (oldVal) {
                $scope.saveCurrentData(oldVal)
                    .done(function() {
                        $scope.reload();
                    })
                    .fail(function() {
                        selectUserIdWatch.ignore(function() {
                            $scope.selectUserId = oldVal;
                        });

                        dialog.information(messages.NeedAtLeastOneDocument_userChange, messages.NeedAtLeastOneDocument_userChange_title);
                    });
            } else {
               $scope.reload();
            }
        });

        $scope.getMetadataTemplates = function() {
            if ($scope.dataList)
                return $scope.dataList;

            return documentSecurityService
                .getMetadataTemplates()
                .then(function(response) {
                    $scope.dataList = response.TemplateList;
                    $scope.userName = response.UserDisplayName;

                    $scope.allDataOption = Enumerable.From($scope.dataList)
                        .FirstOrDefault(function(x) { return x.Name === $scope.ALL_NAME; });
                    $scope.allDataOption.isAll = true;

                    $scope.myCaptureOption = Enumerable.From($scope.dataList)
                        .Where(function(x) { return x.Name === $scope.MY_CAPTURES; })
                        .FirstOrDefault();

                    // remove special option from the list
                    $scope.dataList.splice($scope.dataList.indexOf($scope.allDataOption), 1);
                    $scope.dataList.splice($scope.dataList.indexOf($scope.myCaptureOption), 1);

                    return $scope.dataList;
                }).fail(function(message) { 
                    dialog.error(message).then(function() {
                        javaScriptBoundObject.Cancel();
                    });
                });
        };


        /*
         * Update CanViewable for each row in dataList from the @result
         */
        $scope.updateCanViewByUser = function(result) {
            angular.forEach($scope.dataList, function(x) {
                x.CanViewable = false;
            });
            $scope.allDataOption.CanViewable = false;
            $scope.myCaptureOption.CanViewable = false;
            $scope.dataListUserId = $scope.selectUserId;

            var templateCount = 0;
            angular.forEach(result, function(x) {

                if (x === $scope.ALL_NAME) {
                    $scope.allDataOption.CanViewable = true;
                } else if (x === $scope.MY_CAPTURES) {
                    $scope.myCaptureOption.CanViewable = true;
                } else {
                    $.dataList = $scope.dataList;
                    var aTemplate = Enumerable.From($scope.dataList)
                        .FirstOrDefault(null, function(y) {
                            return (x === y.Name);
                        });

                    if (aTemplate !== null) {                        
                        aTemplate.CanViewable = true;
                        templateCount += 1;
                    }
                }
            });

            var newPermissionGroup = '';
            if ($scope.allDataOption.CanViewable == true)
                newPermissionGroup = allTypes; // View all documents 
            else if ($scope.myCaptureOption.CanViewable == true) {
                if (templateCount > 0)
                    newPermissionGroup = specificAndCapture; // View documents of specific Document Types and all documents the user captures
                else
                    newPermissionGroup = captureOnly; // View documents the user captures only
            } else newPermissionGroup = specific; // View documents of specific Document Types only

            permissionGroupWatch.ignore(function () {
                $scope.permissionGroup = newPermissionGroup;
            });
            
            onPermissionGroupUpdate($scope.permissionGroup, null); // Ensure that stage depend by permissionGroup is update.

            $scope.dirty = result.dirty || false;
        }


        /*
         * Save current CanViewable from dataList to cache.store
         */
        $scope.saveCurrentData = function(oldUserId) {
            console.log("Store current data for user " + oldUserId);
            var deferred = $.Deferred();
            var canViewList = [];
            if ($scope.permissionGroup === allTypes)
                canViewList = [$scope.allDataOption.Name];

            if ($scope.permissionGroup === specific || $scope.permissionGroup === specificAndCapture) {
                canViewList = Enumerable.From($scope.dataList)
                    .Where(function(x) { return x.CanViewable; })
                    .Select(function(x) { return x.Name; })
                    .ToArray();

                if (canViewList.length == 0) {
                    deferred.reject();
                }
            }

            if ($scope.permissionGroup === captureOnly || $scope.permissionGroup === specificAndCapture) {
                canViewList.unshift($scope.myCaptureOption.Name); // add to top of list
            }

            if (deferred.state() !== "rejected") {
                cache.store = cache.store || {};
                cache.store[oldUserId] = canViewList;
                cache.store[oldUserId].dirty = $scope.dirty;
                deferred.resolve();
            }

            return deferred.promise();
        };


        /*
         * Set callback from user name drop-down list.
         */
        $scope.getUsersDropdown = function (callback) {
            $scope.getUsersDropdown_callback = callback;
        };


        /*
         * Get User list from the service and set to drop-down list
         */
        $scope.getUsers = function() {
            if ($scope.userList)
                return $scope.userList;

            return documentSecurityService.getUsers()
                .then(function(result) {
                    $scope.userList = result;

                    if (result.length > 0) {
                        $scope.selectUserId = result[0].Id;

                        if ($scope.getUsersDropdown_callback) {
                            console.log("Set users list");
                            $scope.getUsersDropdown_callback(result);
                        }
                        loadPermissionGroupList();
                    }

                    return $scope.userList;
                }).fail(dialog.error);
        };

        $scope.getData = function() {
            if (cache.store && cache.store[$scope.selectUserId]) {
                // found in cache

                if ($scope.dataListUserId != $scope.selectUserId)
                    $scope.updateCanViewByUser(cache.store[$scope.selectUserId]);
                cache.resolve();
            } else {
                // not found in cache then load from server
                $.when($scope.getMetadataTemplates())
                    .done($scope.getUsers)
                    .done(function() {
                        if ($scope.selectUserId) {
                            documentSecurityService
                                .getMetadataTemplatesByUser($scope.selectUserId)
                                .done(function(response) {
                                    $scope.updateCanViewByUser(response);
                                    $scope.saveCurrentData($scope.selectUserId);
                                    cache.resolve();
                                }).fail(dialog.error);
                        } else {
                            cache.resolve();
                        }
                    });
            }
            return cache;
        };

        $scope.tableParams = new ngTableParams({
            sorting: {
                DisplayName: 'asc'
            },
            filter: {}
        }, {
            counts: [], // hide page count control
            total: 0, //$scope.dataList.length,
            getData: function($defer, params) {
                var data = $scope.dataList;
                if (data) {
                    if (params.sorting()) {
                        data = $filter('orderBy')(data, params.orderBy()); // default ["+DisplayName"]
                    }

                    if (params.filter()) {
                        data = $filter('filter')(data, params.filter());
                    }

                    params.total(data.length);
                    $defer.resolve(data);
                    if ($scope.pluginCheckboxAll) $scope.pluginCheckboxAll();
                }
            }
        });

        $scope.pluginCheckboxAll = function() {
            if ($(".allCheckBox").length !== 0) {
                var template = '<span class="custom-checkbox">' +
                    '<input type="checkbox" ng-model="allDataOption.CanViewable" class="ckbox"  ' +
                    'ng-change="onCanViewChange(allDataOption.Name, allDataOption.CanViewable)" ng-disabled="isGridDisabled()" />' +
                    '<span class="box"><span class="tick"></span></span>' +
                    '</span>';
                var $element = angular.element($('.allCheckBox'));
                $element.html(template);
                $compile($element.contents())($scope);
                $scope.pluginCheckboxAll = null;
            }
        };

        /*
         * handler when CanView check box  changed
         */
        $scope.onCanViewChange = function(name, checked) { 
            $scope.checkAll = !$scope.checkAll;
            $scope.haveDirty = $scope.dirty = true;
            if (name === $scope.ALL_NAME) {
                angular.forEach($scope.dataList, function(x) {
                    x.CanViewable = checked; // tick or un-tick select all option will always clear other options.
                });
            } else {
                $scope.allDataOption.CanViewable = false;
                if (checked) {
                    angular.forEach($scope.dataList, function(x) {
                        if (x.Name === $scope.ALL_NAME)
                            x.CanViewable = false; // clear All option.
                    });
                }
            }
        };

        /*
         * Save to SDC server
         */
        $scope.save = function(closeIfSaved) {
            $scope.saveCurrentData($scope.selectUserId)
                .then(function() {
                    var deferList = [];
                    var action = documentSecurityService.saveMetadataTemplatesPermission;

                    for (var userId in cache.store) {
                        if (cache.store[userId].dirty == true) {
                            var defer = action(userId, cache.store[userId]);
                            defer.userId = userId;
                            deferList.push(defer);
                        }
                    }

                    $.when.apply($, deferList).always(function() {
                        var successCount = 0;
                        var previousError = "";

                        $.each(deferList, function() {
                            if (this.state() == 'resolved') {                                
                                cache.store[this.userId].dirty = false;
                                successCount += 1;
                            } else if (this.state() == 'rejected') {
                                this.fail(function(error) {
                                    // to prevent flood with same error message
                                    if (previousError !== error) {
                                        dialog.error(error);
                                        previousError = error;
                                    }
                                });
                            }
                        });

                        if (successCount === deferList.length) {
                            $scope.haveDirty = false;
                            $scope.dirty = false;
                            var message = messages.SaveSuccessfully;
                            message = message.replace('{0}', successCount);
                            message = message.replace('{1}', successCount > 1 ? 's' : '');
                            toastr.info(message);

                            if (closeIfSaved == true)
                                javaScriptBoundObject.OK();
                        }
                    });
                })
                .fail(function() {
                    dialog.information(messages.NeedAtLeastOneDocument, messages.NeedAtLeastOneDocument_userChange_title);
                });
        };

        $scope.canSave = function() {
            return $scope.haveDirty && $scope.userList != null && $scope.userList.length > 0 && !$scope.inProgress;
        }

        /*
         * Close button clicked
         */
        $scope.close = function() {
            if ($scope.haveDirty) {
                dialog.confirm(messages.Unsaved, messages.UnsavedTitle)
                    .then(function() {
                        $scope.save(true);
                    }).catch(function() {
                        javaScriptBoundObject.Cancel();
                    });
            } else {
                javaScriptBoundObject.Cancel();
            }
        };

        $scope.$on("cfpLoadingBar:loading", function () {
            $scope.inProgress = true;
        });
        $scope.$on("cfpLoadingBar:completed", function () {
            $scope.inProgress = false;
        });

        $scope.reload = function () {
            $scope.getData().then(function () {
                $scope.tableParams.reload();
            });
        };

        $scope.reload();
    }
]);