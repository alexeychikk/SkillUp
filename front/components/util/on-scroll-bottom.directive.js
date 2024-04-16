(function () {
    angular
        .module('skillup')
        .directive('skupOnScrollBottom', skupOnScrollBottom);

    skupOnScrollBottom.$inject = ['$rootScope'];

    function skupOnScrollBottom($rootScope) {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attrs) {
            var reached = false;
            var options;

            scope.$watch(attrs.skupOnScrollBottom, function(value) {
                if (!value) return;
                options = value;
                options.percent = options.percent || 100;
                options.percent /= 100;
            });

            angular.element(element).bind("scroll", function() {
                if (element[0].offsetHeight + element[0].scrollTop >= element[0].scrollHeight * options.percent) {
                    if (!reached || (element[0].offsetHeight + element[0].scrollTop >= element[0].scrollHeight)) {
                        reached = true;
                        $rootScope.$broadcast(options.event, element);
                    }
                } else reached = false;
            });
        }
    }
})();