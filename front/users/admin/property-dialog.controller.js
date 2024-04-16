(function () {
    angular
        .module('skillup')
        .controller('PropertyDialogController', PropertyDialogController);

    PropertyDialogController.$inject = ['$scope', '$mdDialog', 'table', 'columnName'];

    function PropertyDialogController($scope, $mdDialog, table, columnName) {
        $scope.ok = function() {
            $mdDialog.hide();
        };

        //Построение текста который отображается в диалоге
        $scope.title = columnName.toUpperCase();
        $scope.text = '';
        for (var property in table.columns[columnName]) {
            if (table.columns[columnName].hasOwnProperty(property)) {
                $scope.text += property.toUpperCase() + ': ' + table.columns[columnName][property] + '\n';
            }
        }
    }
})();