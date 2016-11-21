module.exports = function () {
    var performanceReferences = {
        // excludes unnecessary properties from the results
        mark: {exclude: ['duration', 'entryType'], cleanMethod: 'clearMarks'},
        measure: {exclude: ['entryType'], cleanMethod: 'clearMeasures'}
    };

    return {
        performanceAPI: {
            createMark: createMark,
            createMeasure: createMeasure,
            cleanAllReferences: cleanAllPerformanceReferences,
            cleanMark: cleanPerformanceReference('mark'),
            cleanMeasure: cleanPerformanceReference('measure'),
            measureResults: performanceMeasureResults,
            markResults: performanceMarkResults
        },
        mutationAPI: {
            set: setMutationObserver,
            disconnect: disconnect
        },
        watchCounter: watchCounter
    };

    /**
     * it creates a "mark" that can be used as starting/ending point to take time measures
     * @param markName: string that will be used to reference to the mark
     */
    function createMark(markName) {
        if (performance.mark === undefined) {
            console.log("performance.mark method not supported");
            return;
        }
        performance.mark(markName);
    }

    /**
     * it creates the "measure" between two marks
     * @param measureName: string that can be used to generate a log
     * @param startingPoint: mark name of the starting point for the measure
     * @param endPoint: mark name of the ending point for the measure
     */
    function createMeasure(measureName, startingPoint, endPoint) {
        if (performance.measure === undefined) {
            console.log("performance.measure method not supported");
            return;
        }
        performance.measure(measureName, startingPoint, endPoint);
    }

    /**
     * it generates the results for the performance object according to the type
     * @param type: (mark | measure)
     * @returns {Array}: array of objects in which each item have the next properties:
     *      name: name of the mark/measure
     *      duration: if the type is "measure", it is the time between the starting and finishing points
     *      startTime
     */
    function performanceResults(type) {
        var performanceResults = [],
            performanceEntries = performance.getEntriesByType(type),
            measureEntriesLength = performanceEntries.length;

        for (var i = 0; i < measureEntriesLength; i++) {
            performanceResults.push(_.omit(performanceEntries[i], performanceReferences[type].exclude));
        }

        return performanceResults;
    }

    /**
     * it returns the array of results for the measures
     * @returns {Array}: each item is an object: {name: 'measureName', duration: milliseconds, startTime: milliseconds}
     */
    function performanceMeasureResults() {
        return performanceResults('measure');
    }

    /**
     * it returns the array of results for the marks
     * @returns {Array}: each item is an object: {name: 'measureName', startTime: milliseconds}
     */
    function performanceMarkResults() {
        return performanceResults('mark');
    }

    /**
     * required function that cleans items from the performance object by type
     * @param type: (mark | measure)
     */
    function cleanPerformanceReference(type) {
        var cleanFn = performanceReferences[type].cleanMethod;

        return performance[cleanFn]();
    }

    /**
     * required function that cleans all performance objects
     */
    function cleanAllPerformanceReferences() {
        cleanPerformanceReference('mark');
        cleanPerformanceReference('measure');
    }

    /**
     * function that generates mutation observer/s for DOM elements
     * Params:
     *    target: node element in which observe the changes (it can be a CSS selector)
     *
     *    configuration: object width one or more properties (eg. {subtree: true}:
     *          general values: (attributes | childList | characterData | subtree)
     *          additional values: (attributeOldValue | characterDataOldValue | attributeFilter) -> make sense depending on the use of the general ones
     *
     *    callbackFn: function to execute when there are mutations. It has as parameter the mutations array:
     *          type: (attributes|characterData|childList)
     *          target: node affected
     *          addedNodes: added nodes
     *          removedNodes:  removed nodes
     *          previousSibling: previous sibling of the added or removed nodes
     *          nextSibling:   next sibling of the added or removed nodes
     *          attributeName: name of the changed attribute
     *          attributeNamespace: namespace of the changed attribute
     *          oldValue:
     */
    function setMutationObserver(target, configuration, callbackFn) {
        var config,
            defaultConfig = {
                attributes: false,
                childList: false,
                characterData: false,
                subtree: false,
                attributeOldValue: false
            },
            observer = new MutationObserver(function (mutations) {
                if (_.isFunction(callbackFn)) {
                    callbackFn(mutations);
                }
            });

        config = angular.extend(defaultConfig, configuration);

        if (_.every(config, function (property) {
                return !property
            })) {
            config.childList = true;
        }

        try {
            observer.observe(target, config);
        } catch (expr) {
            console.error(expr);
        }

        return observer;
    }

    /**
     *
     * @param observer
     */
    function disconnect(observer) {
        observer.disconnect();
    }

    /**
     * watch counter
     *
     * http://www.closedinterval.com/count-angularjs-watchers/
     *
     * usage
     *  ngWatchCount(document.getElementById("foo")) => 200 (passing a dom element)
     *  ngWatchCount(".some-qsa-query") => 900              (passing a querySelectorAll selector string, selector included)
     *  ngWatchCount() == ngWatchCount(document) => 1400    (no argument, will find all watches)
     *
     */
    function watchCounter(base) {
        var slice = [].slice;
        var elems;
        if (base && typeof base !== "string") {
            elems = slice.call(base.querySelectorAll("*"));
            elems.unshift(base);
        } else if (typeof base === "string") {
            elems = slice.call(document.querySelectorAll(base + ", " + base + " *"));
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
};