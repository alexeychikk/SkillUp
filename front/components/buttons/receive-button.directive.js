(function () {
    angular
        .module('skillup')
        .directive('skupReceiveButton', skupReceiveButton);

    skupReceiveButton.$inject = ['templates'];

    function skupReceiveButton(templates) {
        return {
            restrict: 'E',
            templateUrl: templates.receiveButton.templateUrl,
            scope: {
                type: '@?',
                id: '=',
                count: '=',
                received: '=',
                receive: '=?',
                disabled: '=?',
                callback: '=?'
            },
            controller: ReceiveButtonController
        }
    }

    ReceiveButtonController.$inject = ['$scope', '$http', 'loadLoggedUser'];

    function ReceiveButtonController($scope, $http, loadLoggedUser) {
        if (!angular.isNumber($scope.count) || $scope.count < 0) $scope.count = 0;

        if ($scope.type === undefined) $scope.type = 'task';

        if ($scope.receive === undefined) $scope.receive = function () {
            $scope.received = !$scope.received;
            $scope.received ? $scope.count++ : $scope.count--;
            var obj = {};
            obj[$scope.type + '_id'] = $scope.id;
            $http.post('/receive_' + $scope.type, obj).success(function(data) {
                if (!data) {
                    $scope.received = !$scope.received;
                    $scope.received ? $scope.count++ : $scope.count--;
                }
                else loadLoggedUser();
                $scope.callback && $scope.callback({id: $scope.id, received: $scope.received});
            });
        };
    }
})();