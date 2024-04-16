(function () {
    angular
        .module('skillup')
        .controller('NotificationsController', NotificationsController);

    NotificationsController.$inject = ['$scope', 'notifications', 'ScrollLoader'];

    function NotificationsController($scope, notifications, ScrollLoader)
    {
        $scope.newNotifications = [];
        $scope.readNotifications = notifications.readNotifications;

        $scope.onNotsLoadedNew = function(nots) {
            $scope.newNotifications = $scope.newNotifications.concat(nots);
            notifications.setRead(nots);
        };

        $scope.scrollLoaderNew = ScrollLoader($scope, {
            events: 'newNotificationsScrolled',
            method: 'post',
            url: '/notifications',
            body: {read: false, limit: notifications.count},
            onLoadEnd: $scope.onNotsLoadedNew
        });

        if (notifications.count) $scope.scrollLoaderNew.loadMoreData();
        else $scope.scrollLoaderNew.endOfData = true;

        $scope.$on('newNotifications', function() {
            $scope.scrollLoaderNew.body.limit = notifications.count;
            $scope.scrollLoaderNew.loadMoreData();
        });

        $scope.onNotsLoadedRead = function(nots) {
            $scope.readNotifications = $scope.readNotifications.concat(nots);
            notifications.readNotifications = $scope.readNotifications;
            notifications.readNotificationsEnd = $scope.scrollLoaderRead.endOfData;
            console.log(notifications.readNotificationsEnd);
        };

        $scope.scrollLoaderRead = ScrollLoader($scope, {
            events: 'readNotificationsScrolled',
            method: 'post',
            url: '/notifications',
            body: {read: true},
            onLoadEnd: $scope.onNotsLoadedRead
        });

        if (!$scope.readNotifications.length) $scope.scrollLoaderRead.loadMoreData();
        else $scope.scrollLoaderRead.endOfData = notifications.readNotificationsEnd;
    }
})();
