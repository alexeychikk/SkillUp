(function () {
    angular
        .module('skillup')
        .factory('notifications', notifications);

    notifications.$inject = ['$http', '$rootScope'];

    function notifications($http, $rootScope) {
        var count = 0;
        var desc = 0;

        var service = {
            get count() { return count; },
            getCount: getCount,
            setRead: setRead,
            startListening: startListening,
            stopListening: stopListening,
            readNotifications: [],
            readNotificationsEnd: false
        };

        return service;

        function getCount() {
            $http.get('/notifications/count').success(function(res) {
                count = res.count;
                if (count) $rootScope.$broadcast('newNotifications', count);
            });
        }

        function setRead(notifications) {
            var params = {ids: []};
            for (var i in notifications) params.ids.push(notifications[i].id);
            $http.post('/notifications/read', params).success(function(res) {
                if (!res) { /* TODO: some error handling */ }
                count -= notifications.length;
            });
        }

        function startListening() {
            desc = setInterval(getCount, 10000);
        }

        function stopListening() {
            clearInterval(desc);
        }
    }
})();