var fs = require('fs');

describe('Protractor Demo App', function () {
    var results = [], // array because we could want to add more tests
        url = 'http://localhost:8080/example/', // URL in which the app is
        numberOfItems = element(by.id('itemsLength')),
        numberOfWatchers = element(by.id('numberOfWatchers')),
        renderDuration = element(by.id('renderDuration')),
        testButton = element(by.buttonText('generate'));

    beforeEach(function () {
        browser.get(url);
    });

    // execute the test that will record the results 
    it('test with 10000 items', function () {
        // clear the field
        numberOfItems.clear().then(function () {
            // set its value to the number of items we want to test
            numberOfItems.sendKeys(10000);

            // generate the list
            testButton.click();
        });

        numberOfWatchers.getText().then(function (numWatches) {
            renderDuration.getText().then(function (render) {
                results.push('items, 10000, rendering, ' + render + ', watchers, ' + numWatches);
            });
        });
    });

    // print the result in a file
    it('should print result', function () {
        var log = '';

        for (var i = 0; i < results.length; i++) {
            log += results[i] + '\n';
        }
        
        fs.appendFile('results.csv', log, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
});
