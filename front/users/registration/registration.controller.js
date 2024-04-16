(function () {
    angular
        .module('skillup')
        .controller('RegistrationController', RegistrationController);

    RegistrationController.$inject = ['$scope', '$routeParams', '$http', '$location', 'loadLoggedUser', 'isImage',
        '$mdToast', '$rootScope', 'extendedSkills', 'dataURItoBlob'];

    function RegistrationController($scope, $routeParams, $http, $location, loadLoggedUser, isImage, $mdToast,
                                    $rootScope, extendedSkills, dataURItoBlob) {
        $scope.reg = {education: [{}], work: [{}]};

        $scope.step = 1;
        $rootScope.ajaxCall.promise.then(function () {
            if ($location.path() === '/registration/step2') {
                $http.get('/logged_user').success(function (user) {
                    if (!user || !user.length) return;
                    user = user[0];
                    $scope.step = 2;
                    if (user.birthday) $scope.reg.birthday = new Date(user.birthday);
                    if (user.avatar) {
                        $scope.reg.isImageRes = true;
                        $scope.reg.imgSrcRes = '/avatars/' + user.avatar;
                    }
                    $scope.reg.gender = user.gender || 'male';
                    if (user.city) $scope.reg.city = user.city;
                    if (user.country) $scope.reg.country = user.country;
                    if (user.education) {
                        try {
                            $scope.reg.education = JSON.parse(user.education);
                        } catch (e) {}
                        for (var i in $scope.reg.education) {
                            if ($scope.reg.education[i].startYear)
                                $scope.reg.education[i].startYear = +$scope.reg.education[i].startYear;
                            if ($scope.reg.education[i].endYear)
                                $scope.reg.education[i].endYear = +$scope.reg.education[i].endYear;
                        }
                        if (!$scope.reg.education.length) $scope.reg.education.push({});
                    }
                    if (user.work) {
                        try {
                            $scope.reg.work = JSON.parse(user.work);
                        } catch (e) {}
                        for (var i in $scope.reg.work) {
                            if (typeof $scope.reg.work[i].startDate == "string")
                                $scope.reg.work[i].startDate = new Date($scope.reg.work[i].startDate);
                            if (typeof $scope.reg.work[i].endDate == "string")
                                $scope.reg.work[i].endDate = new Date($scope.reg.work[i].endDate);
                        }
                        if (!$scope.reg.work.length) $scope.reg.work.push({});
                    }
                });
            }
            $rootScope.pageTitle = 'Регистрация';

            $scope.reg.nick = $routeParams.nick === '0' ? '' : $routeParams.nick;
            $scope.reg.email = $routeParams.email === '0' ? '' : $routeParams.email;
            $scope.reg.password = $routeParams.password === '0' ? '' : $routeParams.password;
            $scope.passwordStrong = false;

            $scope.showSuccessToast = function () {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Вы успешно зарегистрированы!')
                        .position('top left')
                        .hideDelay(3000)
                );
            };

            $scope.showErrorToast = function (msg) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(msg)
                        .position('top left')
                        .hideDelay(3000)
                );
            };

            $scope.passwordsEqual = function () {
                var err = {notequal: false};
                if (!$scope.reg.password) return err;
                if (!$scope.reg.rePassword) return err;
                if ($scope.getPasswordStrong().notstrong) return err;
                err.notequal = $scope.reg.password !== $scope.reg.rePassword;
                return err;
            };

            $scope.getPasswordStrong = function () {
                var err = {notstrong: false};
                if (!$scope.reg.password) return err;
                err.notstrong = !$scope.passwordStrong;
                return err;
            };

            $scope.vRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            $scope.validateEmail = function () {
                return $scope.vRegex.test($scope.reg.email);
            };
            $scope.validatePasswords = function () {
                return $scope.reg.password === $scope.reg.rePassword;
            };

            $scope.exists = {nick: false, email: false, emailnotvalid: false};
            $scope.checkNick = function () {
                $http.post('/check_nick', {nick: $scope.reg.nick}).success(function (data) {
                    $scope.exists.nick = data ? false : true;
                });
            };
            $scope.checkEmail = function () {
                $http.post('/check_email', {email: $scope.reg.email}).success(function (data) {
                    $scope.exists.email = data ? false : true;
                });
            };

            $scope.$watch('reg.nick', function (newVal) {
                if (newVal) {
                    $scope.checkNick();
                }
                else $scope.exists.nick = false;
            });

            $scope.$watch('reg.email', function (newVal) {
                if (newVal) {
                    if (!$scope.validateEmail()) {
                        $scope.exists.emailnotvalid = true;
                        return;
                    }
                    $scope.exists.emailnotvalid = false;
                    $scope.checkEmail();
                }
                else {
                    $scope.exists.emailnotvalid = false;
                    $scope.exists.email = false;
                }
            });

            //Проверка сложности пароля от 1 до 4, если больше 1 - норм
            $scope.$watch('reg.password', function (newVal) {
                if (newVal) {
                    $scope.checkResult = zxcvbn(newVal, [$scope.reg.name, $scope.reg.nick, $scope.reg.email]);
                    $scope.passwordStrong = $scope.checkResult.score > 1;
                }
            });

            $scope.checkRegInput = function () {
                return $scope.validateEmail() && $scope.validatePasswords() && !$scope.exists.nick && !$scope.exists.email && $scope.passwordStrong;
            };

            $scope.register = function () {
                if ($scope.checkRegInput()) {
                    $http.post('/register', {
                        nick: $scope.reg.nick,
                        name: $scope.reg.name,
                        email: $scope.reg.email,
                        password: $scope.reg.password
                    }).success(function () {
                        $scope.regDataSent = true;
                    }).error(function (err) {
                        $scope.showErrorToast(err.message || 'Введены некорректные данные!');
                    });
                } else if ($scope.checkResult.feedback.warning) {
                    $scope.showErrorToast($scope.checkResult.feedback.warning);
                } else {
                    $scope.showErrorToast('Введены некорректные данные!');
                }
            };

            $scope.showErrorImgToast = function () {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Не удалось загрузить фотографию...')
                        .position('bottom left')
                        .hideDelay(3000)
                        .parent(angular.element(document.querySelector('#toastElem')))
                );
            };

            $scope.reg.imgSrc = '';
            $scope.reg.imgCropRes = '';
            $scope.reg.isImageRes = false;
            $scope.loadImage = function () {
                isImage($scope.reg.imgSrc).then(function (result) {
                    if (!result) {
                        $scope.showErrorImgToast();
                        return;
                    }
                    $scope.reg.isImageRes = result;
                    $scope.reg.imgSrcRes = $scope.reg.imgSrc;
                });
            };

            $scope.handleFileSelect = function (element) {
                var file = element.files[0];
                var reader = new FileReader();
                reader.onload = function (evt) {
                    $scope.$apply(function ($scope) {
                        $scope.reg.isImageRes = true;
                        $scope.reg.imgSrcRes = evt.target.result;
                    });
                };
                reader.readAsDataURL(file);
            };

            $scope.selectImage = function () {
                angular.element(document.querySelector('#fileInput'))[0].click();
            };

            $scope.maxYear = (new Date()).getFullYear();
            $scope.minYear = $scope.maxYear - 100;

            $scope.addEducation = function () {
                $scope.reg.education.unshift({});
            };

            $scope.removeEducation = function (index) {
                $scope.reg.education.splice(index, 1);
            };

            $scope.addWork = function () {
                $scope.reg.work.unshift({});
            };

            $scope.removeWork = function (index) {
                $scope.reg.work.splice(index, 1);
            };

            $scope.goToStep3 = function () {
                for (var i in $scope.reg.education)
                    if (!$scope.reg.education[i].name) $scope.reg.education.splice(i, 1);
                for (var i in $scope.reg.work)
                    if (!$scope.reg.work[i].company) $scope.reg.work.splice(i, 1);

                var fd = new FormData();
                fd.append("avatar", dataURItoBlob($scope.reg.imgCropRes));
                fd.append("birthday", $scope.reg.birthday);
                fd.append("gender", $scope.reg.gender);
                fd.append("city", $scope.reg.city);
                fd.append("country", $scope.reg.country);
                fd.append("education", JSON.stringify($scope.reg.education));
                fd.append("work", JSON.stringify($scope.reg.work));

                $http.post('/update_profile', fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined },
                    transformRequest: angular.identity
                }).success(function (data) {
                    if (data) {
                        $scope.initStep3();
                    }
                });
            };
            $scope.initStep3 = function () {
                $http.get('/logged_user').success(function (user) {
                    if (!user || !user.length) return;
                    user = user[0];

                    $http.get('db/skills').success(function (data) {
                        if (data) {
                            $rootScope.exs = new extendedSkills(data);

                            $scope.currentSkill = $rootScope.exs.root;
                            $scope.skills = $rootScope.exs.skills;
                            //Объект в котором сохраняются id скиллов, которые надо добавить в needs
                            $scope.dataNeeds = {needs: []};
                            //Объект для поиска скилла по названию
                            $scope.query = {};

                            //Функция для поиска совпадений в названиях скиллов с введенным текстом
                            //Возвращает массив подходящих скиллов
                            $scope.query.search = function (text) {
                                var lowercaseQuery = angular.lowercase(text);
                                var filteredSkills = [];
                                for (var id in $scope.skills) {
                                    if ($scope.skills.hasOwnProperty(id)) {
                                        if ($scope.skills[id].title.toLowerCase().indexOf(lowercaseQuery) !== -1) {
                                            filteredSkills.push($scope.skills[id]);
                                        }
                                    }
                                }
                                return filteredSkills;
                            };

                            //Делает выбраный в autocomplete скилл текущим
                            $scope.query.selectedItemChanged = function (skill) {
                                if (skill) $scope.currentSkill = skill;
                            };

                            //Делает выбраный скилл текущим (по нажатию на скилл)
                            $scope.setToCurrent = function (skill) {
                                if ($scope.addClicked) $scope.addClicked = false;
                                else $scope.currentSkill = skill;
                            };

                            $scope.addClicked = false;
                            //Добавляет id скилла в needs и убирает плюсик с него
                            $scope.addNeed = function (id) {
                                $scope.addClicked = true;
                                if ($scope.dataNeeds.needs.indexOf(id) == -1) {
                                    $scope.dataNeeds.needs.push(id);
                                    if ($scope.currentSkill == $scope.skills[id]) {
                                        $scope.currentSkill.added = true;
                                        $scope.skills[id].added = true;
                                    } else {
                                        $scope.skills[id].added = true;
                                    }
                                }
                            };

                            //Убирает id скилла из нидсов
                            $scope.removeNeed = function (id) {
                                $scope.dataNeeds.needs.splice($scope.dataNeeds.needs.indexOf(id), 1);
                                $scope.skills[id].added = false;
                            };

                            $scope.erase = function () {
                                $scope.dataNeeds.needs = [];
                            };

                            //По нажатию "Готово" отправляет выбраные нидсы на сервер для записи в БД
                            $scope.done = function () {
                                $http.post('/needs', $scope.dataNeeds).success(function () {
                                    loadLoggedUser(function () {
                                        $location.path('/users/' + user.id);
                                    });
                                });
                            };

                            $scope.step = 3;
                        }
                    });
                });
            };
        });
    }
})();