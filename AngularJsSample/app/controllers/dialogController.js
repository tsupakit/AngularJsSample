app.controller('dialogController', function ($scope, $modalInstance, data)
{
    $scope.data = data;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.dismiss = function () {
        $modalInstance.dismiss();
    };
});