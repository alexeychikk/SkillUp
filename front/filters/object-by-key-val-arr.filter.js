(function () {
    angular
        .module('skillup')
        .filter('objectByKeyValFilterArr', objectByKeyValFilterArr);

    function objectByKeyValFilterArr() {
        return function (input, filterKey, filterVal) {
            var filteredInput = [];
            angular.forEach(input, function (value, key) {
                if (value[filterKey] && (new RegExp(filterVal, "i")).test(value[filterKey])) {
                    filteredInput.push(value);
                }
            });
            return filteredInput;
        };
    }
})();