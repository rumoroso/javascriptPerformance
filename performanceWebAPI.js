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

// it adds a time mark in this point of the code 
// that can be referenced in "measure" method 
createMark('point_A');

// it creates a measure between defined marks
createMeasure('measure A to B', 'point_A', 'point_B');

showPerformanceInfo('measure');
showPerformanceInfo('mark');

function createMark(markName) {
    if (performance.mark === undefined) {
        console.log("performance.mark method not supported");
        return;
    }
    performance.mark(markName);
}

function createMeasure(measureName, startingPoin, endPoint) {
    if (performance.measure === undefined) {
        console.log("performance.measure method not supported");
        return;
    }
    performance.measure(measureName, startingPoin, endPoint);
}

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
