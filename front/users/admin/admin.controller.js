(function () {
    angular
        .module('skillup')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$http', '$rootScope', '$mdDialog', 'getColumns', 'getRowsOnPage', 'templates'];

    function AdminController($scope, $http, $rootScope, $mdDialog, getColumns, getRowsOnPage, templates) {
        //По нажатию на заголовок боковой панели показывает статистику
        $scope.showStatistic = true;
        $scope.statistic = function () {
            $scope.showStatistic = true;
        };

        $rootScope.ajaxCall.promise.then(function () {
            //Последняя развернутая таблица инициализируется нуллом
            $scope.lastExpandedTable = null;

            $scope.database = {
                name: 'skillup', tables: [
                    {name: 'skills', rows: null, columnNames: null},
                    {name: 'tasks', rows: null, columnNames: null},
                    {name: 'users', rows: null, columnNames: null},
                    {name: 'solutions', rows: null, columnNames: null}
                ]
            };

            //Функция для загрузки данных при разворачивании списка колонок
            $scope.expand = function (table) {
                $scope.pageNumber = 0;

                //rowsOnScreen - количество строк таблицы, которые поместяться в видимой области
                if (document.getElementById('tables').offsetHeight >= 290) {
                    $scope.rowsOnScreen = Math.floor((document.getElementById('tables').offsetHeight - 192) / 48);
                } else {
                    $scope.rowsOnScreen = 8;
                }

                //Поиск по выбраной колонке
                $scope.filter = {};
                $scope.filter.query = "";
                //Не работает в текущей версии материала (9.4)
                //$scope.filter.resetQuery = function () {
                //    this.query = "";
                //};
                $scope.filter.byColumnName = "id";

                //Выбраные строки в таблице
                $scope.selection.indexes = [];
                $scope.selection.allSelected = false;

                //Скрывает статистику, чтобы показать таблицу
                $scope.showStatistic = false;

                //Закрытие прошлой развернутой таблицы и сохранение текущей
                if ($scope.lastExpandedTable && $scope.lastExpandedTable !== table) {
                    $scope.lastExpandedTable.expanded = false;
                }
                table.expanded = !table.expanded;
                $scope.lastExpandedTable = table;

                //Первая буква имени в верхнем регистре
                $scope.tableName = $scope.lastExpandedTable.name.slice(0, 1).toUpperCase() + $scope.lastExpandedTable.name.slice(1);
                //Кол-во строк на странице зависит от размера экрана
                $scope.lastExpandedTable.rowsPerPage = $scope.rowsOnScreen;
                //Переменная связаная с полем выбора кол-ва строк на странице
                $scope.footer = {};
                $scope.footer.rowsPerPage = $scope.lastExpandedTable.rowsPerPage;

                if ($scope.lastExpandedTable.expanded && !$scope.lastExpandedTable.columnNames) {
                    //Загрузка названий (типов и тд) колонок развернутой таблицы
                    getColumns($scope.lastExpandedTable);
                    //Загрузка строк развернутой таблицы
                    if (!$scope.lastExpandedTable.rows) {
                        $http.post('/db/' + $scope.lastExpandedTable.name, {}).success(function (data) {
                            $scope.lastExpandedTable.rows = data;

                            //Получение количества строк в таблице
                            $http.get('/db/' + $scope.lastExpandedTable.name + '/rows_count').success(function (count) {
                                $scope.lastExpandedTable.rowsCount = count;
                                if (count < $scope.rowsOnScreen) $scope.lastExpandedTable.rowsPerPage = count;

                                //Получаем строки отображаемые на текущей странице
                                $scope.rowsOnPage = getRowsOnPage($scope.lastExpandedTable.rows,
                                    $scope.lastExpandedTable.rowsPerPage,
                                    $scope.pageNumber,
                                    $scope.lastExpandedTable.rowsCount);

                                //Сохраняем исходную таблицу
                                //$scope.savedTable = angular.copy($scope.lastExpandedTable);
                            }).error(function (error) {
                                console.log(error);
                            });
                        }).error(function (error) {
                            console.log(error);
                        });
                    }
                } else if ($scope.lastExpandedTable.rowsCount < $scope.rowsOnScreen)
                    $scope.footer.rowsPerPage = $scope.lastExpandedTable.rowsCount;
            };

            //Показывает диалог в котором отображаются свойства колонки (columnName) в таблице (table)
            $scope.columnInfo = function (table, columnName, event) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    targetEvent: event,
                    templateUrl: templates.propertyDialog.templateUrl,
                    controller: templates.propertyDialog.controller,
                    locals: {
                        table: table,
                        columnName: columnName
                    }
                });
            };

            //Функция сортировки, при нажатии на название колонки таблицы
            $scope.sortColumn = function (table, columnName) {
                table.columnClicked = table.columnClicked || {};
                //Проверка, если последняя сортированая колонка не равна текущей - удаляем ее
                if (table.columnClicked[columnName] === undefined){
                    table.columnClicked[columnName] = 0;
                    if (Object.keys(table.columnClicked).length > 1) table.columnClicked = {};
                }

                //Сортировка колонки в зависимости от значения переменной columnClicked[columnName]: 1, -1, 0; соответственно прямая, обратная или исходная
                if (!table.columnClicked[columnName]) {
                    table.columnClicked[columnName] = 1;
                    $scope.rowsOnPage.sort(function (a, b) {
                        if (a[columnName] > b[columnName]) return 1;
                        if (a[columnName] < b[columnName]) return -1;
                        return 0;
                    });
                } else if (table.columnClicked[columnName] === 1) {
                    table.columnClicked[columnName] = -1;
                    $scope.rowsOnPage = $scope.rowsOnPage.reverse();
                } else {
                    table.columnClicked[columnName] = 0;
                    $scope.rowsOnPage = getRowsOnPage(table.rows, table.rowsPerPage, $scope.pageNumber, table.rowsCount);
                }
            };

            //Пометить строки таблицы на текущей странице выбраными или снять метки, при нажатии на checkbox в заголовке таблицы
            $scope.selectAllRows = function () {
                if (!$scope.selection.allSelected) {
                    for (var obj in $scope.rowsOnPage) {
                        if ($scope.rowsOnPage.hasOwnProperty(obj))
                            $scope.selection.indexes[$scope.rowsOnPage[obj]['id']] = true;
                    }
                }
                else {
                    $scope.selection.indexes = [];
                }
            };

            //Переход на страницу влево
            $scope.leftPage = function () {
                $scope.pageNumber -= 1;
                $scope.reset();
            };

            //Переход на страницу вправо и подгрузка данных, если необходимо
            $scope.rightPage = function () {
                $scope.pageNumber += 1;

                //Подгрузка
                if ($scope.lastExpandedTable.rows.length <= $scope.lastExpandedTable.rowsPerPage * ($scope.pageNumber + 1)) {
                    $http.post('/db/' + $scope.lastExpandedTable.name,
                        {limit: $scope.lastExpandedTable.rowsPerPage, offset: $scope.lastExpandedTable.rows.length}
                    ).success(function (data) {
                            $scope.lastExpandedTable.rows = $scope.lastExpandedTable.rows.concat(data);
                            //Сохраняем исходную таблицу
                            //$scope.savedTable = angular.copy($scope.lastExpandedTable);

                            $scope.reset();
                        }).error(function (error) {
                            console.log(error);
                        });
                } else {
                    $scope.reset();
                }
            };

            //Обнуляем выделение и обновляем строки отображаемые на текущей странице при смене страницы
            $scope.reset = function () {
                $scope.selection.indexes = [];
                $scope.selection.allSelected = false;

                //Получаем строки отображаемые на текущей странице
                $scope.rowsOnPage = getRowsOnPage($scope.lastExpandedTable.rows,
                    $scope.lastExpandedTable.rowsPerPage,
                    $scope.pageNumber,
                    $scope.lastExpandedTable.rowsCount);
            };

            //Если изменяется кол-во строк на странице надо пересчитать номер страницы и догрузить данные при надобности
            $scope.$watch('footer.rowsPerPage', function (newValue) {
                if($scope.lastExpandedTable && $scope.lastExpandedTable.rows) {
                    $scope.pageNumber = 0;
                    $scope.lastExpandedTable.rowsPerPage = newValue;

                    //Подгрузка
                    if ($scope.lastExpandedTable.rows.length <= $scope.lastExpandedTable.rowsPerPage) {
                        $http.post('/db/' + $scope.lastExpandedTable.name,
                            {limit: $scope.lastExpandedTable.rowsPerPage, offset: $scope.lastExpandedTable.rows.length}
                        ).success(function (data) {
                                $scope.lastExpandedTable.rows = $scope.lastExpandedTable.rows.concat(data);
                                //Сохраняем исходную таблицу
                                //$scope.savedTable = angular.copy($scope.lastExpandedTable);

                                //Получаем строки отображаемые на текущей странице
                                $scope.rowsOnPage = getRowsOnPage($scope.lastExpandedTable.rows,
                                    $scope.lastExpandedTable.rowsPerPage,
                                    $scope.pageNumber,
                                    $scope.lastExpandedTable.rowsCount);
                            }).error(function (error) {
                                console.log(error);
                            });
                    } else {
                        //Получаем строки отображаемые на текущей странице
                        $scope.rowsOnPage = getRowsOnPage($scope.lastExpandedTable.rows,
                            $scope.lastExpandedTable.rowsPerPage,
                            $scope.pageNumber,
                            $scope.lastExpandedTable.rowsCount);
                    }
                }
            });

            $scope.$watchCollection('selection.indexes', function (newValue) {
                $scope.selection = $scope.selection || {};
                $scope.selection.count = 0;
                if (newValue && newValue.length) {
                    for (var obj in newValue) {
                        if (newValue.hasOwnProperty(obj))
                            if (newValue[obj]) {
                                $scope.selection.selected = true;
                                $scope.selection.count += 1;
                            }
                    }
                    $scope.selection.selected = !!$scope.selection.count;
                } else {
                    $scope.selection.selected = false;
                }
            });
        });
    }
})();