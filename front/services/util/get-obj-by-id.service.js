(function () {
    angular
        .module('skillup')
        .factory('getObjByID', getObjByID);

    function getObjByID() {
        return function(id, collection) {
            for (var elem in collection)
                if (collection[elem].id === id) return collection[elem];
        };
    }
})();