/**
 *  Main library
 *  @author Meshin Dmitry <0x7ffec at gmail.com>
 */
'use strict';

var testmodule = testmodule || {};

testmodule.testfunc1 = function() {
    alljs.system.log($(arguments[0]).attr('class'));
    testmodule.func2();
};

testmodule.func2 = function() {
    console.log('func2!');
};

testmodule.prettyprint = {};

testmodule.prettyprint.html = function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

testmodule.prettyprint.init = function() {
    $.each( $('.prettyprint'), function(i, e) {
        var _html = $(e).html().replace('alljs-dispatcher-', 'alljs-dispatcher');
        $(e).html( testmodule.prettyprint.html(_html) );
    });
};
