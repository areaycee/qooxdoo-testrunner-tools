# qx-testrunner-selenium


This is a modification of qx-phantom.js adapted for use with the Selenium Webdriver Python bindings
 * [qx-phantom] https://github.com/qooxdoo/qx-phantom

qx-selenium allows you to run qooxdoo testrunner unit tests from the command line.

If don't want to or cant use Phantom in your environment this may be an alternative.  

This has been tested with Selenium 2.5x, Python 2.7x.

Note this should not be confused with running actual Selenium ux tests which this is not intended for. Instead see
 * [qxwebdriver-java] https://github.com/qooxdoo/qxwebdriver-java

## Setup

Install the Selenium Webdriver Python bindings.


Build the console view of the Test Runner and write it to a separate path.

    $ ./generate.py test-source \
      -m TESTRUNNER_VIEW:testrunner.view.Console \
      -m BUILD_PATH:test-console

Verify the build was successful by opening the console view in a browser. In the web developer console, after a couple of seconds, you should see something like:

    2619 tests ready. Call qx.core.Init.getApplication().runner.view.run() to start.

## Usage

Basic 
``testrunner-selenium.py http://localhost/<path-to-test-runner>``

The return status is the failed count (same as qx-phantom). There are additional xml, json and plain text output options.

For more options
``testrunner-selenium.py --help``