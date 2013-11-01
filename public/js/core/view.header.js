define([ 'jQuery', 'Underscore', 'Backbone', '../screens/commons/UmxView', 'Typeahead',
        '../screens/commons/LinkController', 'text!./view.header.html',
        '../screens/export/Export', 'BootstrapDropdown' ],

function($, _, Backbone, UmxView, Typeahead, LinkController, ViewHeaderTemplate,
        ExportDialog) {
    var View = Backbone.View.extend({
        template : _.template(ViewHeaderTemplate),

        events : {
            'click .export' : 'exportClicked'
        },

        renderPage : function() {
            return this.asyncElement(function(elm) {
                var searchInput = elm.find('.umx-typeahead');
                var linkController = LinkController.getInstance();
                var url = linkController.getApiTypeaheadLink() + '?query=%QUERY';
                var typeahead = searchInput.twitterTypeahead({
                    remote : url,
                    limit : 15
                });
                
                var body = $('body');
                body.on('typeahead:selected', function(event, datum) {
                    if (datum && datum.id) {
                        Backbone.history.navigate('/workspace/' + datum.id, true);
                    }
                    searchInput.val('');
                });
                body.keypress(function(e) {
                    // http://api.jquery.com/focus-selector/
                    var $focused = $(document.activeElement);
                    var tagName = $focused.prop('tagName').toLowerCase();
                    if (tagName == 'body') {
                        searchInput.focus();
                    }
                });
                body.keydown(function(event) {
                    if (event.altKey) {
                        if (event.which == 76) {
                            // alt+L
                            searchInput.focus();
                        }
                    }
                });
                
            });
        },

        exportClicked : function(event) {
            console.log('export clicked');
            var dialog = new ExportDialog({
                title : 'Hello',
                content : 'Bonjour',
                actions : [ {
                    label : 'Fermer',
                    primary : true,
                    action : function() {
                        dialog.hide();
                    }
                } ]
            });
            dialog.show();
        }
    });
    return View;

});
