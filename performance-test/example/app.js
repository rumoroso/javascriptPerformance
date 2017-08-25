var example = angular.module('example', []);

var itemListComponent = { // dummy component that is used as example to be tested
        templateUrl: './item-list-component.tpl.html',
        bindings: {
            items: '<'
        }
    },
    performanceComponent = { // component that includes the elements that can generate
                             // the component to test with specific configuration and
                             // that shows the results
        templateUrl: './performance-component.tpl.html',
        controller($element, $scope, $compile, $timeout) {
            var componentToTest,
                self = this,
                element = angular.element,
                componentToTestTpl = '<item-list-component items="items"></item-list-component>';

            self.generate = generate;
            self.itemsLength = 0;

            generate();

            // it generates the component with the configuration
            // and also takes measurements of time and number of
            // watchers
            function generate() {
                var fetchStart, renderStart;

                // if there was a previous list, it should be
                // removed and the results cleant
                cleanPreviousResult();

                componentToTest = element(componentToTestTpl);

                // to be sure the time spent generating the data.
                // it could be important because any stuff done
                // during the testing could also affects the results
                fetchStart = performance.now();
                $scope.items = generateItems(self.itemsLength);
                self.fetchDuration = performance.now() - fetchStart;

                appendComponentAndTakeRenderingTime();

                function cleanPreviousResult() {
                    self.fetchDuration = '';
                    self.renderDuration = '';
                    self.numberOfWatchers = '';

                    if (componentToTest) {
                        componentToTest
                            .remove();
                    }
                }

                function appendComponentAndTakeRenderingTime() {
                    $element
                        .append(componentToTest);

                    renderStart = performance.now();
                    $compile(componentToTest)($scope);

                    // to be sure the measurements are taken after 
                    // any other angular stuff is done
                    $timeout(function () {
                        self.numberOfWatchers = watchCounter('.list-with-repeat');
                        self.renderDuration = performance.now() - renderStart;
                    });
                }
            }

            function generateItems(itemsLength) {
                var data = [];

                for (var i = 0; i < itemsLength; i++) {
                    data.push(genNumber(5)); // number with 5 figures
                }

                return data

                // random number generator of integers
                function genNumber(figuresLength) {
                    return Math.floor(Math.random() * Math.pow(10, figuresLength));
                }
            }
        }
    };

example
    .component('performanceComponent', performanceComponent)
    .component('itemListComponent', itemListComponent);

/**
 * watch counter
 * http://www.closedinterval.com/count-angularjs-watchers/
 *
 * usage
 *  ngWatchCount(document.getElementById("foo")) => 200 (passing a dom element)
 *  ngWatchCount(".some-qsa-query") => 900              (passing a querySelectorAll selector string, selector included)
 *  ngWatchCount() == ngWatchCount(document) => 1400    (no argument, will find all watches)
 */
function watchCounter(selector) {
    var slice = [].slice;
    var elems;
    if (selector && typeof selector !== "string") {
        elems = slice.call(selector.querySelectorAll("*"));
        elems.unshift(selector);
    } else if (typeof selector === "string") {
        elems = slice.call(document.querySelectorAll(selector + ", " + selector + " *"));
    } else {
        elems = slice.call(document.querySelectorAll("*"));
    }
    return elems.map(function (elem) {
        var data = angular.element(elem).data();

        return data.$scope || null;
    }).filter(function (scope) {
        return scope && scope.$$watchers;
    }).reduce(function (tmp, scope) {
        if (tmp.cache[scope.$id]) {
            return tmp;
        }
        tmp.cache[scope.$id] = true;
        tmp.count += scope.$$watchers.length;
        return tmp;
    }, {
        count: 0,
        cache: {}
    }).count;
}
