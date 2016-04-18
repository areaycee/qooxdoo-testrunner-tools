// Author: Robert Cosgrove
// This is a modification of qx-phantom.js adapted for use with the Selenium Webdriver
// https://github.com/qooxdoo/qx-phantom

(function() {
    var OUTPUT_FORMATS, CONSOLE, VERBOSE, loadedBefore, page, testClasses, url, results, formatTestResults, interval;

    VERBOSE = false;

    CONSOLE = false;

    OUTPUT_FORMATS = ["html", "xml", "min", "json"];

    page = window;

    /**
      Format the results in some way
    */
    formatTestResults = function(results, format) {
        switch (format) {
            case "json":
                return JSON.stringify(results);

            // Simple readable output
            case "html":
                var out = "<html><body>";
                for (var testName in results) {
                    var test = results[testName];
                    var names = testName.match(/(.+):(.+)/);
                    out += ":" + test.state + " :" + names[1] + ' :' + names[2] + "<br>\r\n";
                }
                out += "</body></html>";
                return out;

            // Minimal readable output.
            // This is designed to look something like the console output of PHPUnit
            case "min":
                var out = '';
                for (var testName in results) {
                    var test = results[testName];
                    if (test.state == "failed") {
                        out += "F";
                    } else if (test.state == "error") {
                        out += "E";
                    } else {
                        out += ".";
                    }
                }
                return out;

            // Basic JUnit formatter.
            case "xml":
                var testCount = 0;
                var out = '';
                for (var testName in results) {
                    var test = results[testName];
                    var names = testName.match(/(.+):(.+)/);
                    out += '<testcase classname="' + names[1] + '" name="' + names[2] + '">';
                    if (test.state !== "success") {
                        var messages = test.messages ? test.messages.join("\n") : "";
                        out += '<failure>' + messages + '</failure>';
                    }
                    out += '</testcase>';
                    testCount++;
                }
                out += '</testsuite>';
                // first row last
                out = '<testsuite tests="' + testCount + '">' + out;
                return out;
        }
        return null;
    };

    getFailedCount = function(results) {
        var failed = 0;
        for (var testName in results) {
            var test = results[testName];
            if (test.state !== "success") {
                failed++;
            }
        }
        return failed;
    };

    createOutputElm = function(id, value) {
        var div = document.createElement("input");
        div.value = value;
        div.id = id;
        document.body.appendChild(div);
    };

    page.onConsoleMessage = function(msg) {
        if (CONSOLE) {
            return console.log("CONSOLE: " + msg);
        }
    };

    page.onError = function(msg, trace) {
        var msgStack;
        msgStack = ["ERROR: " + msg];
        if (trace && trace.length) {
            msgStack.push("TRACE:");
            trace.forEach(function(t) {
                var functionContent;
                functionContent = "";
                if (t["function"]) {
                    functionContent = "(in function '" + t["function"] + "')";
                }
                return msgStack.push(" -> " + t.file + ": " + t.line + " " + functionContent);
            });
        }
        console.error(msgStack.join("\n"));
    };

    loadedBefore = false;

    var runAll = function() {
        var processTestResults;
        if (loadedBefore) {
            return;
        }
        loadedBefore = true;
        window.setTimeout(function() {
            var testSuiteState;
            testSuiteState = (function() {
                return qx.core.Init.getApplication().runner.getTestSuiteState();
            }).call();

            switch (testSuiteState) {
                case "init":
                case "loading":
                case "ready":
                    console.log("Unable to start test suite");
                    throw "Unable to start test suite";
            }
        }, 120000);
        // run the test suite
        (function() {
            var runner;
            if (typeof qx === "undefined") {
                console.log("qooxdoo not found");
                return;
            }
            runner = qx.core.Init.getApplication().runner;
            if (runner.getTestSuiteState() !== "ready") {
                return runner.addListener("changeTestSuiteState", function(e) {
                    var state;
                    state = e.getData();
                    if (state === "ready") {
                        return runner.view.run();
                    }
                });
            } else {
                return runner.view.run();
            }
        }).call();
        processTestResults = function() {
            var exception, getRunnerStateAndResults, results, state, _len, _ref, _ref1;
            getRunnerStateAndResults = function() {
                return (function() {
                    var error, runner, state;
                    try {
                        runner = qx.core.Init.getApplication().runner;
                        state = runner.getTestSuiteState();
                    } catch (_error) {
                        error = _error;
                        console.log("Error while getting the test runners state and results");
                        return [null, null];
                    }
                    if (state === "finished") {
                        return [state, runner.view.getTestResults()];
                    } else {
                        return [state, null];
                    }
                }).call();
            };
            _ref = getRunnerStateAndResults(), state = _ref[0], results = _ref[1];
            if (!state) {
                return;
            }
            if (state === "error") {
                console.log("Error running tests");
                throw "Error running tests";
            }
            if (state === "finished") {
                console.log("Finished running test suite.");

                // create an element for the failed count output
                createOutputElm("test_failed", getFailedCount(results));

                // always create the minimal output
                createOutputElm("test_results_min", formatTestResults(results, "min"));

                // detailed output
                var outFmt = window.QX_SELENIUM_OUTPUT_FORMAT;
                if (outFmt) {
                    if (OUTPUT_FORMATS.indexOf(outFmt) > -1) {
                        console.log("Creating output '"+outFmt+"'");
                        createOutputElm("test_results_"+outFmt, formatTestResults(results, outFmt));
                    } else {
                        throw "Invalid output format specified";
                    }
                }
                
                // end execution
                clearInterval(interval);
                return error.length;
            }
        };
        return window.setInterval(processTestResults, 500);
    }
    interval = runAll.call(this);
}).call(this);