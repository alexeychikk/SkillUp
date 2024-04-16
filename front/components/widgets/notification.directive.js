(function () {
    angular
        .module('skillup')
        .directive('skupNotification', skupNotification);

    skupNotification.$inject = ['templates', 'notificationTypes'];

    function skupNotification(templates, notificationTypes) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: templates.notification.templateUrl,
            scope: {
                notification: '='
            },
            link: link,
            controller: NotificationController
        };

        function link(scope, element, attrs) {
            scope.notificationType = notificationTypes[scope.notification.type];
            var el = angular.element(element[0].querySelector('.notification-icon'));
            el.addClass(scope.notificationType.icon);

            if (scope.notification.sm_checked_correct === false) {
                el.removeClass(scope.notificationType.icon);
                el.addClass('mdi-close');
            }
        }
    }

    NotificationController.$inject = [];

    function NotificationController($scope) {

    }
})();