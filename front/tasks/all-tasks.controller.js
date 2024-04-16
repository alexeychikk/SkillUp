(function () {
    angular
        .module('skillup')
        .controller('AllTasksController', AllTasksController);

    AllTasksController.$inject = ['$scope', '$http', 'getObjByID', 'parseSkills', '$rootScope', '$location',
        'isLoggedIn', '$mdToast'];

    function AllTasksController($scope, $http, getObjByID, parseSkills, $rootScope, $location, isLoggedIn, $mdToast) {
        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) { $location.path('/main'); return; }
            $rootScope.pageTitle = 'Задания';
            $rootScope.navtabs = {};//TODO: забиндить какие-нибудь табсы
            $scope.getObjByID = getObjByID;

            var DynamicItems = function() {
                /**
                 * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
                 */
                this.loadedItems = [];

                /** @type {number} Total number of downloaded items. */
                this.numItems = 0;
                this.toLoad = 0;

                /** @const {number} Number of items to fetch per request. */
                this.LIMIT = 50;

                $scope.columnSort = {'date_created': 'desc'};

                this.sort = {
                    columnName: Object.keys($scope.columnSort)[0] || 'date_created',
                    direction: $scope.columnSort[Object.keys($scope.columnSort)] || 'desc'
                };
            };

            // Required.
            DynamicItems.prototype.getItemAtIndex = function(index) {
                if (index < this.numItems) {
                    return this.loadedItems[index];
                } else {
                    this._fetchMoreItems(index);
                }
            };

            // Required.
            DynamicItems.prototype.getLength = function() {
                return this.numItems + 1;
            };

            DynamicItems.prototype._fetchMoreItems = function(index) {
                if (index > this.toLoad) {
                    this.toLoad += this.LIMIT;

                    var self = this;
                    $http.post('db/tasks', {limit: self.LIMIT, offset: self.numItems, sort: self.sort}).success(function (rows) {
                        self.loadedItems = self.loadedItems.concat(rows);
                        for (var id in self.loadedItems) {
                            parseSkills(self.loadedItems[id]);
                        }
                        self.numItems = self.toLoad;
                    });
                }
            };

            DynamicItems.prototype.resetSort = function (sort) {
                this.sort = sort;
                this.loadedItems = [];
                this.toLoad = this.numItems = 0;
                this._fetchMoreItems(0);
            };

            DynamicItems.prototype.viewTask = function (id) {
                if (!$scope.expandButtonClicked) $location.path('/tasks/' + id);
                else $scope.expandButtonClicked = false;
            };

            DynamicItems.prototype.taskReceived = function (data) {
                var title = getObjByID(data.id, $scope.dynamicTasks.loadedItems).title;
                var text = data.received
                    ? 'Задание "' + title + '" взято. Оно появится на главной странице.'
                    : 'Задание "' + title + '" удалено.';
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(text)
                        .hideDelay(2000)
                );
            };

            $scope.dynamicTasks = new DynamicItems();

            //Функция сортировки, при нажатии на название колонки
            $scope.sortColumn = function (columnName) {
                //Сортировка списка в зависимости от значения переменной $scope.column[columnName]: (asc, desc)
                if (!$scope.columnSort[columnName] || $scope.columnSort[columnName] == 'desc') {
                    $scope.columnSort = {};
                    $scope.columnSort[columnName] = 'asc';
                    $scope.dynamicTasks.resetSort({
                        columnName: columnName,
                        direction: 'asc'
                    });
                } else if ($scope.columnSort[columnName] == 'asc') {
                    $scope.columnSort[columnName] = 'desc';
                    $scope.dynamicTasks.resetSort({
                        columnName: columnName,
                        direction: 'desc'
                    });
                }
            };

            $scope.lastExpandedTask = {};
            $scope.expand = function (task) {
                $scope.expandButtonClicked = true;
                if ($scope.lastExpandedTask && $scope.lastExpandedTask.id == task.id)
                    $scope.lastExpandedTask.expanded = !$scope.lastExpandedTask.expanded;
                else {
                    $scope.lastExpandedTask.expanded = false;
                    $scope.lastExpandedTask = task;
                    $scope.lastExpandedTask.expanded = true;
                }
            };
        });
    }
})();