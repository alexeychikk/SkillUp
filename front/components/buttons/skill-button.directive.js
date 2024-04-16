(function () {
    angular
        .module('skillup')
        .directive('skupSkillButton', skupSkillButton);

    skupSkillButton.$inject = ['$rootScope', '$timeout', 'templates'];

    function skupSkillButton($rootScope, $timeout, templates) {
        return {
            restrict: 'E',
            templateUrl: templates.skillButton.templateUrl,
            scope: {
                type: '@?',
                id: '=',
                exs: '=?',
                count: '=?',
                withArrows: '=?',
                countVisible: '=?',
                withRemove: '=?',
                onRemove: '=?',
                withAdd: '=?',
                onAdd: '=?',
                hideAdd: '=?',
                hideRemove: '=?',
                tooltipAdd: '@?',
                tooltipRemove: '@?'
            },
            link: link,
            controller: SkillButtonController
        };

        function link(scope, element, attrs) {
            $timeout(function () {
                scope.exs = scope.exs || $rootScope.exs;
                if (attrs.countVisible === "") scope.countVisible = true;
                if (attrs.withArrows === "") scope.withArrows = true;
                if (attrs.withRemove === "") scope.withRemove = true;
                if (attrs.withAdd === "") scope.withAdd = true;
                if (attrs.hideAdd === "") scope.hideAdd = true;
                if (attrs.hideRemove === "") scope.hideRemove = true;
                var el = element[0].children[0];
                var par = element[0].parentNode;
                scope.$watch('count', function () {
                    var percent;
                    if (scope.count === undefined || scope.count === null) {
                        percent = 0;
                        el.style.background = 'linear-gradient(to left, rgba(255, 255, 255, 0.5) '
                            + percent + '%, transparent ' + percent + '%)';
                        el.style['background-color'] = '';
                    } else if (angular.isNumber(scope.count)) {
                        percent = Math.floor(100 - scope.count * 100);
                        if (percent > 100) percent = 100;
                        else if (percent < 0) percent = 0;
                        el.style.background = 'linear-gradient(to left, rgba(255, 255, 255, 0.5) '
                            + percent + '%, transparent ' + percent + '%)';
                        el.style['background-color'] = '';
                    }
                });
                var parWidth = par.offsetWidth;
                if (par.id == 'kostyl') {
                    scope.$watch('mouseOn', function (val) {
                        if (val) {
                            if (scope.withArrows && !scope.countVisible) par.style.width = par.offsetWidth + 40 + 'px';
                            if (scope.withRemove && scope.hideRemove) par.style.width = par.offsetWidth + 20 + 'px';
                            if (scope.withAdd && scope.hideAdd) par.style.width = par.offsetWidth + 20 + 'px';
                        } else par.style.width = parWidth + 'px';
                    });
                }
            }, 0);
        }
    }

    SkillButtonController.$inject = ['$scope'];

    function SkillButtonController($scope) {
        $scope.addCount = function () {
            $scope.count += 0.1;
            $scope.count = +$scope.count.toFixed(1);
            if ($scope.count > 1) $scope.count = 1;
        };
        $scope.subCount = function () {
            $scope.count -= 0.1;
            $scope.count = +$scope.count.toFixed(1);
            if ($scope.count < 0.1) $scope.count = 0.1;
        };
    }
})();