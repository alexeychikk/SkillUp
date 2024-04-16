(function () {
    angular
        .module('skillup')
        .controller('RestorePasswordController', RestorePasswordController);

    RestorePasswordController.$inject = ['$scope', '$http', '$mdDialog', '$location'];

    function RestorePasswordController($scope, $http, $mdDialog, $location) {
        $mdDialog.hide();
        $scope.restore = {};
        $scope.restore.emailErr = false;
        $scope.restore.codeErr = false;
        $scope.restore.checkErr = false;

        $scope.send = function(email) {
            $scope.checkEmail();

            if (!$scope.restore.emailErr) {
                $http.post('/restore', {email: email}).success(function (data) {
                    $scope.restore.secretCode = data;
                    console.log(data);
                });
            }
        };

        //TO DO: secretCode должен быть только на серваке. Перенести проверку на сервер.
        $scope.done = function () {
            if($scope.restore.code === $scope.restore.secretCode) {
                $scope.restore.changePass = true;
            }
            else {
                $scope.restore.codeErr = true;
            }
        };

        $scope.changePassword = function (password, rePassword) {
            if(password && rePassword && (password === rePassword)) {
                $http.post('/change_password', {email: $scope.restore.email, password: password}).success(function(data) {
                    $location.path(data);
                })
            }
            else {
                $scope.restore.checkErr = true;
            }
        };

        $scope.getRestoreErr = function() {
            return $scope.restore;
        };

        $scope.checkEmail = function () {
            $http.post('/check_email', {email: $scope.restore.email}).success(function (data) {
                $scope.restore.emailErr = data ? true : false;
            });
        };

        $scope.goToMain = function () {
            $location.path('/main');
        };
    }
})();