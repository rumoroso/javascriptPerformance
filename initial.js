/* performance web API:
*  var properties = [
*            "navigation",
*            "onresourcetimingbufferfull",
*            "timing"
*        ],
*        methods = [
*            "clearMarks",
*            "clearMeasures",
*            "clearResourceTimings",
*            "getEntries",
*            "getEntriesByType",
*            "getEntriesByName",
*            "mark",
*            "measure",
*            "now",
*            "toJSON",
*            "translateTime",
*            "setResourceTimingBufferSize"
*        ];
*/

// with this method this line adds a time mark 
// that can be referenced in "measure" method 
performance.mark('point_A');

// get a measure between defined points
performance.measure('measure A to B', 'point_A', 'point_B');

showPerformanceInfo('measure');
showPerformanceInfo('mark');

function showPerformanceInfoByType(type) {
    var performanceEntries = performance.getEntriesByType(type),
        measureEntriesLength = performanceEntries.length,
        types = {
            // excludes unneeded properties
            mark: {exclude: ['duration', 'entryType'], cleanMethod: 'clearMarks'},
            measure: {exclude: ['entryType'], cleanMethod: 'clearMeasures'}
        };

    for (var i = 0; i < measureEntriesLength; i++) {
        performanceEntries[i] = _.omit(performanceEntries[i], types[type].exclude);
    }

    console.log("%c Performance property %s ", "color: #000; background: #EEE; font-size: 12pt", type);
    console.table(performanceEntries);

    cleanPerformanceStuff(types[type].cleanMethod);

    function cleanPerformanceStuff(cleanFn){
        performance[cleanFn]();
    }
}
