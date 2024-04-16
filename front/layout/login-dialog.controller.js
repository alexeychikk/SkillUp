(function () {
    angular
        .module('skillup')
        .controller('LoginDialogController', LoginDialogController);

    LoginDialogController.$inject = ['$scope', '$mdDialog', '$rootScope'];

    function LoginDialogController($scope, $mdDialog, $rootScope) {
        $scope.log = {};

        $scope.hide = function () {
            $scope.log.email = 'loh';
            $scope.log.password = 'loh';
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $scope.log.email = 'loh';
            $scope.log.password = 'loh';
            $mdDialog.hide();
        };
        $scope.answer = function () {
            if (!$scope.log.email || !$scope.log.password) return;
            $rootScope.loginData = {email: $scope.log.email, password: $scope.log.password};
        };

        $scope.getLoginErr = function () {
            return $rootScope.loginErr;
        };
    }
})();
