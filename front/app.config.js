(function() {
    angular
        .module('skillup')
        .config(config);

    config.$inject = ['$locationProvider', '$routeProvider', '$mdThemingProvider', 'hljsServiceProvider',
        '$httpProvider', 'markedProvider', 'templates'];

    function config($locationProvider, $routeProvider, $mdThemingProvider, hljsServiceProvider, $httpProvider,
                    markedProvider, templates) {
        $locationProvider.html5Mode(true);

        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.headers.common["Accept"] = "application/json";
        $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

        $routeProvider
            .when('/admin', templates.admin)
            .when('/main', templates.main)
            .when('/users', templates.allUsers)
            .when('/tasks', templates.allTasks)
            .when('/tasks/:task_id', templates.oneTask)
            .when('/skills', templates.skills)
            .when('/users/:user_id', templates.profile)
            .when('/competences', templates.competences)
            .when('/registration',templates.registration)
            .when('/registration/step2', templates.registration)
            .when('/registration/nick/:nick/email/:email/password/:password*', templates.registration)
            .when('/restore', templates.restorePassword)
            .otherwise({redirectTo: '/main'});

        /*    $mdThemingProvider.theme('default')
         .primaryPalette('indigo', {
         'default': '500',
         'hue-1': '300',
         'hue-2': '800',
         'hue-3': 'A100'
         })
         .accentPalette('pink', {
         'default': '400',
         'hue-1': '300',
         'hue-2': '800',
         'hue-3': 'A100'
         })
         .warnPalette('red', {
         'default': '500',
         'hue-1': '300',
         'hue-2': '800',
         'hue-3': 'A100'
         });*/

        hljsServiceProvider.setOptions({
            tabReplace: '    '
        });

        markedProvider.setOptions({
            gfm: true,
            tables: true,
            highlight: function (code, lang) {
                if (lang) {
                    return hljs.highlight(lang, code, true).value;
                } else {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
    }
})();