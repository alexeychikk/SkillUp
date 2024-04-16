(function () {
    angular
        .module('skillup')
        .filter('gender', gender);

    function gender() {
        return function (input) {
            return input == 'male' ? 'Мужской': 'Женский';
        };
    }
})();