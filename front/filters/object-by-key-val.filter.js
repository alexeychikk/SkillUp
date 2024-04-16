(function () {
    angular
        .module('skillup')
        .filter('objectByKeyValFilter', objectByKeyValFilter);

    function objectByKeyValFilter() {
        return function (input, filterKey, filterVal) {
            var filteredInput = {};
            angular.forEach(input, function (value, key) {
                if (value[filterKey] && (new RegExp(filterVal, "i")).test(value[filterKey])) {
                    filteredInput[key] = value;
                }
            });
            return filteredInput;
        };
    }
})();