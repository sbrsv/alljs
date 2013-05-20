/**
 *  Main library
 *  @author Meshin Dmitry <0x7ffec at gmail.com>
 */
'use strict';

var alljs = alljs || [];

//-----------------------------------------------------------------------------

/**
 * 	Options Object
 */
if (!alljs.options) {
	alljs.options = {
		DEBUG_MODE: false
	};
};
//-----------------------------------------------------------------------------

/**
 * 	SYSTEM library
 */
// first initialization of system object
alljs.system = alljs.system || {};

// check if we in debug mode
alljs.system.is_debug_mode = function () {
	return (alljs.options.DEBUG_MODE && alljs.options.DEBUG_MODE === true);
};

alljs.system.log_array = alljs.system.log_array || {};

// logging some message
alljs.system.log = function (message) {
	alljs.system.is_debug_mode() && window.console && console.log(message);
};

// logging warning
alljs.system.warn = function (message) {
	alljs.system.is_debug_mode() && window.console && console.warn(message);
};

// logging error
alljs.system.error = function (message) {
	alljs.system.is_debug_mode() && window.console && console.error(message);
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

    dispatch_object.removeClass('alljs-dispatcher').addClass('alljs-dispatcher-executed');

	alljs.system.log("Executing: " + func_name);

    // Allow fn to be a function object or the name of a global function
    var fn = top.window;
    var parts = func_name.split('.');

    for ( var i = 0; i < parts.length; i++ ) {
        if (fn[parts[i]]) {
            fn = fn[parts[i]];
        }
    }

    if ( fn ) {
        return fn.apply(alljs, arguments || []);
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
    	alljs.system.dispatch_element(element);
    });
};

alljs.system.showElement = function(obj, mode) {
	var elem = typeof obj === "string" ? $(obj) : obj;

	if (elem) {
		if (!mode) {
			if (!elem.is(':visible')) {
				elem.show();
			} else {
				elem.hide();
			}
		} else {
			if (mode == 1) {
				elem.show();
			} else {
				elem.hide();
			}
		}
	}
};

//-----------------------------------------------------------------------------
// decoding array values from string
Array.prototype.fromString = function ( str ) {
	var values = str.split(","),
		value = null;

	while (value = values.shift()) {
		this.push(value);
	}
};

//-----------------------------------------------------------------------------

/**
 * 	Google Analytics library
 */

alljs.ga = alljs.ga || {};

// tracking any virtual page
alljs.ga.track_virtual_page = function ( page ) {
	if ( alljs.system.not_empty_string( page ) ) {
		_gaq.push(['_trackPageview', '/virtual/' + page]);
	} else {
		alljs.system.warn('Can not track empty virtual page');
	}
};

// adding trans with GA
alljs.ga.add_trans = function ( trans_data ) {
    _gaq.push([
        '_addTrans',
        trans_data.ord_id,
        trans_data.store_name,
        trans_data.total,
        trans_data.tax,
        trans_data.shipping,
        '',    // city
        '',    // state or province
        ''     // country
    ]);
};

// adding trans with GA
alljs.ga.add_item = function ( item ) {
    _gaq.push([
        '_addItem',
        item.ord_id,        // order ID - necessary to associate item with transaction
        item.item_id,       // SKU/code - required
        item.item_url,      // product name
        item.cats,          // category or variation
        item.unit_price,    // unit price - required
        item.quantity       // quantity - required
    ]);
};

alljs.ga.dispatch_trans = function () {
	$.each ( $(".alljs-ga-trans-dispatcher"), function(index, element) {
		var trans		= $(element),
			ord_id		= trans.data('ord_id'),
			store_name	= trans.data('store_name'),
			total		= trans.data('total'),
			tax			= trans.data('tax'),
			shipping	= trans.data('shipping');

        var trans_object = {ord_id: ord_id, store_name: store_name, total: total, tax: tax, shipping: shipping};

		if ( !ord_id || !store_name || !total ) {
			alljs.system.warn('Wrong params: ');
			alljs.system.log(element);
            alljs.system.log(trans_object);
			return;
		}
		
		alljs.system.log("Sending TRANS GA stats: ");
		alljs.system.log(trans_object);
		alljs.ga.add_trans( trans_object );
	});
};

alljs.ga.dispatch_item = function () {
	
	var item_trans_has = false;
	
	$.each ( $(".alljs-ga-item-dispatcher"), function(index, element) {
		var item = $(element),
			ord_id		= item.data('ord_id'),
			item_id		= item.data('item_id'),
			item_url	= item.data('item_url'),
			cats		= item.data('cats'),
			unit_price	= item.data('unit_price'),
			quantity	= item.data('quantity');
			
		if ( !ord_id || !item_id || !item_url || !cats || !unit_price || !quantity ) {
			alljs.system.warn('Wrong params: ');
			alljs.system.log(element);
			return;
		}
		
		var item_object = {ord_id: ord_id, item_id: item_id, item_url: item_url, cats: cats, unit_price: unit_price, quantity: quantity};
		
		alljs.system.log("Sending ITEM GA stats: ");
		alljs.system.log(item_object);		
		alljs.ga.add_item(item_object);
		item_trans_has = true;
	});
	
	if ( item_trans_has ) {
		// finishing trans
		_gaq.push(['_trackTrans']);
	}
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