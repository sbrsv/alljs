/**
 *  Main library
 *  @author Meshin Dmitry <0x7ffec at gmail.com>
 */
'use strict';
/**
 * 	Google Analytics library
 * 	// TODO: fix everything to new version of alljs
 */

var ga = ga || {};

// tracking any virtual page
ga.track_virtual_page = function ( page ) {
    if ( alljs.system.not_empty_string( page ) ) {
        _gaq.push(['_trackPageview', '/virtual/' + page]);
    } else {
        alljs.system.warn('Can not track empty virtual page');
    }
};

// adding trans with GA
ga.add_trans = function ( trans_data ) {
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
ga.add_item = function ( item ) {
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

ga.dispatch_trans = function () {
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
        ga.add_trans( trans_object );
    });
};

ga.dispatch_item = function () {

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
        ga.add_item(item_object);
        item_trans_has = true;
    });

    if ( item_trans_has ) {
        // finishing trans
        _gaq.push(['_trackTrans']);
    }
};