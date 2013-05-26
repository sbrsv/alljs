/**
 *  Main library
 *  @author Meshin Dmitry <0x7ffec at gmail.com>
 */
'use strict';

var alljs = alljs || [];

//-----------------------------------------------------------------------------

alljs.options = alljs.options || {
    debug_mode: false
};

/**
 *  Initializing alljs with some options.
 */
alljs.options.init = function() {
    var el = arguments[0];
    var arr = [];
    for (var i=0, attrs=el.attributes, l=attrs.length; i<l; i++){
        var nodeName    = attrs.item(i).nodeName,
            nodeValue   = attrs.item(i).nodeValue;

        if ( nodeName.match(/data-options-/i) ) {
            nodeName = nodeName.replace('data-options-', '')
                               .replace('.', '_')
                               .replace('-', '_')
                               .trim();

            alljs.options[nodeName] = nodeValue;
        }
    }
    //console.log(alljs.options);
};

alljs.options.init_json = function () {
    var el = arguments[0];
    var options_json = alljs.system.data(el, 'options');
    var parsed_json = JSON.parse(options_json);

    for (var key in parsed_json){
        alljs.options[key] = parsed_json[key];
    }

    //console.log(alljs.options);
};

//-----------------------------------------------------------------------------

/**
 * 	SYSTEM library
 */
// first initialization of system object
alljs.system = alljs.system || {};

// check if we in debug mode
alljs.system.is_debug_mode = function () {
	return (alljs.options.debug_mode && alljs.options.debug_mode == true);
};

alljs.system.log_array = alljs.system.log_array || [];

// logging some message
alljs.system.log = function (message) {
    alljs.system.log_array.push(message) && alljs.system.is_debug_mode() && window.console && console.log(message);
};

// logging warning
alljs.system.warn = function (message) {
    alljs.system.log_array.push(message) && alljs.system.is_debug_mode() && window.console && console.warn(message);
};

// logging error
alljs.system.error = function (message) {
    alljs.system.log_array.push(message) && alljs.system.is_debug_mode() && window.console && console.error(message);
};

/**
 * Getting value of data-tag
 */
alljs.system.data = function (element, name) {
    var dataName = 'data-' + name;

    /**
     * @element Element
     */
    return element.getAttribute(dataName);
};

// checking that it is string and not empty
alljs.system.not_empty_string = function (str) {
    if (str && typeof str === "string") {
        return true;
    }

    alljs.system.warn('Empty string for not_empty_string function');

    return false;
};

/**
 * 	Dispatching one element
 */
alljs.system.dispatch_element = function (element) {
	var dispatch_object	= $(element);
	var func_name = dispatch_object.data('function');

	alljs.system.log("Executing: " + func_name);

    // Allow fn to be a function object or the name of a global function
    var fn = top.window;
    var parts = func_name.split('.');

    for ( var i = 0; i < parts.length; i++ ) {
        if (fn[parts[i]]) {
            fn = fn[parts[i]];
        }
    }

    if ( fn && typeof fn === 'function') {
        return fn.apply(fn, arguments || []);
    }

    alljs.system.error('Function does not exists!');

    return false;
};

// dispatching all
alljs.system.dispatch = function ( container ) {

	var elements = null;

	if ( typeof (container) === 'undefined' ) {
		elements = $("div.alljs-dispatcher");
	} else {
		elements = $("div.alljs-dispatcher", $("#" + container));
	}

    $.each(elements, function(index, element){
        $(element).removeClass('alljs-dispatcher').addClass('alljs-dispatcher-executed');
    	alljs.system.dispatch_element(element);
    });
};

//-----------------------------------------------------------------------------
// decoding array values from string
Array.prototype.fromString = function ( str, delimiter ) {
    if ( typeof delimiter == undefined ) {
        delimiter = ",";
    }
	var values = str.split(delimiter),
		value = null;

	while (value = values.shift()) {
		this.push(value);
	}
};

//-----------------------------------------------------------------------------
/**
 * Example:
 *      var array1 = ["Vijendra","Singh"];
        var array2 = ["Singh", "Shakya"];
        // Merges both arrays and gets unique items
        var array3 = array1.concat(array2).unique();

 * @returns {Array}
 */
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

//-----------------------------------------------------------------------------
/**
 * @param arr1
 * @param arr2
 * @returns {Array}
 */
alljs.system.mergeArrays = function( arr1, arr2 ) {
    return arr1.concat(arr2).unique();
};

//-----------------------------------------------------------------------------
// cacher functionality
alljs.cacher = alljs.cacher || {};

// stored data
alljs.cacher.data = alljs.cacher.data || {};

// check if cache exists in data
alljs.cacher.exists = function ( cache_name ) {
	return alljs.cacher.data.hasOwnProperty(cache_name);
};

// read cache if it is exists and return
alljs.cacher.read = function ( cache_name ) {
	if ( alljs.cacher.exists( cache_name ) ) {
		return alljs.cacher.data[cache_name];
	} else {
		return null;
	}
};

// write data to cache by name
alljs.cacher.write = function ( cache_name, cache_data ) {
	alljs.cacher.data[cache_name] = cache_data;
};

//-----------------------------------------------------------------------------

alljs.cookie = alljs.cookie || {};
alljs.cookie.pluses = /\+/g;
alljs.cookie.defaults = {};

alljs.cookie.raw = function(s) {
    return s;
};

alljs.cookie.decoded = function(s) {
    return decodeURIComponent(s.replace(alljs.cookie.pluses, ' '));
};

/**
 * Setting cookie
 * @param key
 * @param value
 * @param options
 * @return {*}
 */
alljs.cookie.cookie = function(key, value, options) {
    // key and at least value given, set cookie...
    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value == null)) {
        options = $.extend({}, alljs.cookie.defaults, options);

        if (value == null) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path    ? '; path=' + options.path : '',
            options.domain  ? '; domain=' + options.domain : '',
            options.secure  ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || alljs.cookie.defaults || {};
    var decode = options.raw ? alljs.cookie.raw : alljs.cookie.decoded;
    var cookies = document.cookie.split('; ');
    for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
        if (decode(parts.shift()) === key) {
            return decode(parts.join('='));
        }
    }
    return null;
};

alljs.flyspy = alljs.flyspy || {};
alljs.flyspy.init = function () {
    $(window).on('scroll', function(event){
        $.each($('.flyspy'), function(index, element){
            var original_top = $(element).data('original-top');

            if ( !original_top ) {
                original_top = $(element).get(0).offsetTop;
                $(element).attr('data-original-top', original_top);
            }

            var div_correction = 20,
                parent_left = $($(element).parent()).get(0).offsetLeft + $($(element).parent()).width() - $(element).width() - div_correction,
                bottom_flag = (window.pageYOffset + $(element).height() > $($(element).parent()).height() + $($(element).parent()).get(0).offsetTop);

            if ( bottom_flag ) {
                var additional_offset = (window.pageYOffset + $(element).height()) - ($($(element).parent()).height() + $($(element).parent()).get(0).offsetTop);
                $(element).css('position', 'fixed')
                    .css('left', parent_left + 'px')
                    .css('top', -additional_offset + 'px');
            } else if ( window.pageYOffset >= original_top ) {
                $(element).css('position', 'fixed')
                    .css('left', parent_left + 'px')
                    .css('top', '20px');
            } else {
                $(element).css('position', 'inherit');
            }
        });
    });
};

//-----------------------------------------------------------------------------

// Dispatching all system
$(document).ready(function () {
    alljs.system.dispatch();
});