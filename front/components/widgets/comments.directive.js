(function () {
    angular
        .module('skillup')
        .directive('skupComments', skupComments);

    skupComments.$inject = ['templates'];

    function skupComments(templates) {
        return {
            restrict: 'E',
            templateUrl: templates.comments.templateUrl,
            scope: {
                idSrc: '=',
                callback: '=?'
            },
            link: link,
            controller: CommentsController
        };

        function link(scope, element, attrs) {
            scope.el = document.getElementById('comment');

            var oldCommentHeight = scope.el.offsetHeight;
            scope.$watch('src.comment', function (newValue) {
                if (newValue && oldCommentHeight && scope.el.offsetHeight != oldCommentHeight) {
                    scope.el.parentNode.parentNode.style.height =  scope.el.offsetHeight + 9 + 'px';
                    oldCommentHeight = scope.el.offsetHeight;
                }
            });
        }
    }

    CommentsController.$inject = ['$scope', '$rootScope', '$http', '$mdToast'];

    function CommentsController($scope, $rootScope, $http, $mdToast) {
        $scope.loggedUser = $rootScope.loggedUser;
        $scope.src = {};
        $scope.src.comments = [];

        updateComments($scope.idSrc);

        $scope.src.addComment = function () {
            $http.post('/add_comment', {src: $scope.idSrc, content: $scope.src.comment}).success(function (data) {
                if (data == 'added') {
                    $scope.src.comment = '';
                    updateComments($scope.idSrc);
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('При добавлении комментария произошла ошибка')
                            .hideDelay(2000)
                    );
                }
            });
            $scope.callback && $scope.callback($scope.src.comment);
        };

        function updateComments(srcID) {
            $http.post('/db/comments', {src: srcID}).success(function (rows) {
                $scope.src.comments = rows;
                var date = new Date();
                var timeElapsed;
                for (var index in $scope.src.comments) {
                    timeElapsed = new Date(date - new Date($scope.src.comments[index].date_created)).getTime();
                    if (timeElapsed >= 2592000000) $scope.src.comments[index].timeElapsed = new Date(timeElapsed).toLocaleDateString();
                    else if (timeElapsed >= 86400000) $scope.src.comments[index].timeElapsed = Math.floor(timeElapsed / 86400000) + ' д.';
                    else if (timeElapsed >= 3600000) $scope.src.comments[index].timeElapsed = Math.floor(timeElapsed / 3600000) + ' ч.';
                    else if (timeElapsed >= 60000) $scope.src.comments[index].timeElapsed = Math.floor(timeElapsed / 60000) + ' м.';
                    else $scope.src.comments[index].timeElapsed = Math.floor(timeElapsed / 1000) + ' с.';
                }
            });
        }
    }
})();