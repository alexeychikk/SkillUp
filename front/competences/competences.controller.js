(function () {
    angular
        .module('skillup')
        .controller('CompetencesController', CompetencesController);

    CompetencesController.$inject = ['$location', 'isLoggedIn'];

    function CompetencesController($location, isLoggedIn) {
        if (!isLoggedIn()) {
            $location.path('/main');
            return;
        }
    }
})();