(function () {
    angular
        .module('skillup')
        .factory('isImage', isImage);

    isImage.$inject = ['$q'];

    function isImage($q) {
        return  function(src) {
            var deferred = $q.defer();
            var image = new Image();
            image.onerror = function() {
                deferred.resolve(false);
            };
            image.onload = function() {
                deferred.resolve(true);
            };
            image.src = src;
            return deferred.promise;
        };
    }
})();