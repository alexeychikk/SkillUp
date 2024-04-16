(function () {
    angular
        .module('skillup')
        .factory('ScrollLoader', ScrollLoader);

    ScrollLoader.$inject = ['$http'];

    function ScrollLoader($http) {
        return function(scope, options) {
            function ScrollLoaderInstance() {
                this.events = options.events || 'indexPageScrolled';

                this.url = options.url || 'db/tasks';
                this.body = options.body || {};
                this.method = options.method || 'post';
                this.body.offset = options.body.offset || 0;
                this.body.limit = options.body.limit || 20;

                this.onLoadStart = options.onLoadStart;
                this.onLoadEnd = options.onLoadEnd;

                this.endOfData = false;
            }

            ScrollLoaderInstance.prototype.loadMoreData = function() {
                if (!this.endOfData) {
                    var self = this;
                    this.loaded = false;
                    this.onLoadStart && this.onLoadStart();
                    $http[this.method](this.url, this.body).success(function(data) {
                        if (data.length) {
                            self.body.offset += data.length;
                        }
                        console.log(data.length);
                        console.log(self.body.limit);
                        if (data.length < self.body.limit || !data.length) self.endOfData = true;
                        self.loaded = true;
                        self.onLoadEnd && self.onLoadEnd(data);
                    });
                }
            };

            var sl = new ScrollLoaderInstance();

            if (angular.isArray(sl.events)) {
                for (var i in sl.events) {
                    scope.$on(sl.events[i], function() { sl.loadMoreData(); });
                }
            }
            else scope.$on(sl.events, function() { sl.loadMoreData(); });

            return sl;
        };
    }
})();