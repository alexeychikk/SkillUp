(function () {
    angular
        .module('skillup')
        .directive('skupHighlightSkill', skupHighlightSkill);

    skupHighlightSkill.$inject = ['$timeout'];

    function skupHighlightSkill($timeout) {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element, attributes) {
            attributes.$observe('skupHighlightSkill', function (newValue) {
                if (newValue == scope.$parent.skill.id) {
                    var el = document.getElementById(newValue).lastChild.firstChild;
                    //console.log({e: el});
                    $timeout(function () {
                        el.scrollIntoView(true);
                        var oldNodeValue = el.attributes[0].nodeValue;
                        el.attributes[0].nodeValue += ' highlighted-skill-animation highlighted-skill';
                        $timeout(function () {
                            el.attributes[0].nodeValue = oldNodeValue + ' highlighted-skill-animation';
                            $timeout(function () {
                                el.attributes[0].nodeValue = oldNodeValue;
                            },700);
                        },700);
                    });
                }
            });
        }
    }
})();