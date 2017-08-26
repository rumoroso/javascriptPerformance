var fs = require('fs'); // to access to the file in which the results will be recorded

describe('Performance test Demo', function () {
    var result,
        results = [],
        url = 'http://localhost:8080/example/', // URL in which the app is
        testsToDo = [1000, 2500, 5000, 7500, 10000], // this would be the list the list of tests 
                                                     // we want to do. It could stored in a file
                                                     // that returns the configuration for different
                                                     // situations (i.e. test after build vs test every night)
        resultsFile = 'results.csv',
        numberOfItems = element(by.id('itemsLength')),
        numberOfWatchers = element(by.id('numberOfWatchers')),
        renderDuration = element(by.id('renderDuration')),
        testButton = element(by.buttonText('generate'));

    beforeEach(function () {
        browser.get(url);
    });

    // repeat the same test for each value of items length we 
    // want to take measures of
    testsToDo.forEach(function (testWithLength) {
        // execute the test that will record the results 
        it('test with ' + testWithLength + ' items', function () {

            // First we generate the widget with its content:
            // 1) clear the field
            numberOfItems.clear().then(function () {
                // 2) set its value to the number of items we want to test
                numberOfItems.sendKeys(testWithLength);

                // 3) generate the list
                testButton.click();
            });

            // Now we access to the results that are shown
            numberOfWatchers.getText().then(function (numWatches) {
                renderDuration.getText().then(function (render) {
                    result = 'items, ' + testWithLength + ', rendering, ' + render + ', watchers, ' + numWatches;
                    // Add the to the array of results
                    results.push(result);

                    // just to show in the console while the test is running
                    console.log('Measuring with ' + testWithLength + ': ' + result);
                });
            });
        });
    });

    // print the results in the file
    it('should print result', function () {
        var log = '';

        for (var i = 0; i < results.length; i++) {
            log += results[i] + '\n';
        }

        fs.appendFile(resultsFile, log, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
});