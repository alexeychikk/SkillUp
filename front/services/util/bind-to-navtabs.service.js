(function () {
    angular
        .module('skillup')
        .factory('bindToNavtabs', bindToNavtabs);

    bindToNavtabs.$inject = ['$rootScope'];

    function bindToNavtabs($rootScope) {
        return function(scope, bindObjName) {
            $rootScope.navtabs = scope[bindObjName];

            $rootScope.$watch('navtabs.selected', function (newValue, oldValue) {
                if (newValue !== undefined) scope[bindObjName].selected = newValue;
            });

            scope.$watch(bindObjName + '.selected', function (newValue, oldValue) {
                if (newValue !== undefined) $rootScope.navtabs.selected = newValue;
            });
        };
    }
})();