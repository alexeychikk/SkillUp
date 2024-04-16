(function () {
    angular
        .module('skillup')
        .factory('getEndingVariant', getEndingVariant);

    function getEndingVariant() {
        return function(number, variants) {
            var ending, i;
            number = number % 100;
            if (number >= 11 && number <= 19) {
                ending = variants[2];
            }
            else {
                i = number % 10;
                switch (i) {
                    case (1): ending = variants[0]; break;
                    case (2):
                    case (3):
                    case (4): ending = variants[1]; break;
                    default: ending = variants[2];
                }
            }
            return ending;
        };
    }
})();