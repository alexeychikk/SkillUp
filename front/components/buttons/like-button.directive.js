(function () {
    angular
        .module('skillup')
        .directive('skupLikeButton', skupLikeButton);

    skupLikeButton.$inject = ['templates'];

    function skupLikeButton(templates) {
        return {
            restrict: 'E',
            templateUrl: templates.likeButton.templateUrl,
            scope: {
                type: '@',
                id: '=',
                likes: '=',
                liked: '=',
                like: '=?',
                disabled: '=?',
                size: '@'
            },
            controller: LikeButtonController
        }
    }

    LikeButtonController.$inject = ['$scope', '$http', 'loadLoggedUser'];

    function LikeButtonController($scope, $http, loadLoggedUser) {
        if($scope.size == "" || $scope.size == undefined) $scope.size = 24;
        if ($scope.like === undefined) $scope.like = function () {
            $scope.liked = !$scope.liked;
            $scope.liked ? $scope.likes++ : $scope.likes--;
            var obj = {};
            obj[$scope.type + '_id'] = $scope.id;
            $http.post('/like_' + $scope.type, obj).success(function(data) {
                if (!data) {
                    $scope.liked = !$scope.liked;
                    $scope.liked ? $scope.likes++ : $scope.likes--;
                    return;
                }
                loadLoggedUser();
            });
        };
    }
})();