#!/usr/bin/env python
# Execute qx testrunner and extract report
#
# This requires testrunner to be built with: 
# generate.py test -m TESTRUNNER_VIEW:testrunner.view.Console -m BUILD_PATH:test-console
#
# Basic Usage: testrunner-selenium.py --runner="http://localhost/<path-to-test-runner>" 

from selenium import webdriver

import sys, getopt
import shutil, os, fileinput, re
from os.path import join, isdir

PATH = os.path.dirname(os.path.abspath(__file__))

OUTPUT_PATH = None

#OUTPUT_PATH = join(PATH, 'test-reports', 'qx-testrunner-results')

# local.. Does not work in Chrome! (This is set up for FF anyway)
#RUNNER = join('file:///', 'path', 'to', 'test', 'runner')
# hosted
#RUNNER = "http://localhost/<path-to-test-runner>" 

RUNNER = ""

# xml, json, txt
OUTPUT_FORMAT = "xml"  


HELP = "\nSet these or just edit the script header!\n\n --runner='runner path' Either http(s):// or file:/// \n\n --format='format'      'xml' (basic JUnit), 'json', 'txt'\n\n --output='path/filename' (file ext added)\n"

# The maximum seconds to wait for the tests to complete.  
# If the tests hang and don't complete for some reason then you wont find out about it until this expires.
# If the tests are likely to exceed this then it will need to be increased.
MAX_WAIT    = 60 * 5


def main(argv):

    try:
        opts, args = getopt.getopt(argv, "h", ["help", "output=", "runner=", "format="])
    except getopt.GetoptError:
        print HELP
        sys.exit(2)

    runnerPath      = RUNNER
    outputFormat    = OUTPUT_FORMAT
    outputPath      = OUTPUT_PATH
    # args
    for opt, arg in opts:
        if opt in ("-h"):
            print HELP
            sys.exit()
        elif opt in ("--runner"):
           runnerPath = arg
        elif opt in ("--format"):
           outputFormat = arg
        elif opt in ("--output"):
           outputPath = arg

    if not runnerPath:
        print HELP
        sys.exit(2)

    print '\nQX Selenium Testrunner'

    browser = webdriver.Firefox()
    browser.set_window_size(200,50)
    browser.set_window_position(0, 0)
    browser.get(runnerPath)

    try:
        # run test
        js = open(join(PATH, 'qx-selenium.js'))
        browser.execute_script(js.read())
        browser.implicitly_wait(MAX_WAIT)
        print browser.find_element_by_id("test_results_min").get_attribute('value')+'\n'

        if outputPath and outputFormat:
            # test result
            resultElm = browser.find_element_by_id("test_results_"+outputFormat)
            if not resultElm:
                 print "Invalid output format " + outputFormat
                 sys.exit(1)

            # output to file
            results = resultElm.get_attribute('value')
            outPath = outputPath + '.' + outputFormat
            out     = open(outPath, 'w')
            out.write(results)
            print 'Written "' + outPath +'"'


        # return failed count
        failedElm = browser.find_element_by_id('test_failed')
        failed    = int(failedElm.get_attribute('value'))
        browser.close()

        if failed > 0:
            print failed + ' tests failed!\n'
            sys.exit(failed)
        else:
            print 'All tests successful!\n'
            sys.exit(0)

        
    except Exception, e:
        print "Error: Something probably went wrong with the webdriver"
        print e
        browser.close()
        sys.exit(1)


if __name__ == "__main__":
   main(sys.argv[1:])