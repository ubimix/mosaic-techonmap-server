define([ 'jQuery', 'Underscore', 'Backbone', '../screens/commons/UmxView',
        'Typeahead', '../screens/commons/LinkController',
        'text!./view.header.html', '../screens/export/Export',
        'BootstrapDropdown' ],

function($, _, Backbone, UmxView, Typeahead, LinkController,
        ViewHeaderTemplate, ExportDialog) {

    var View = UmxView.extend({

        template : _.template(ViewHeaderTemplate),

        getUser : function() {
            return this.options.user;
        },
        isLogged : function() {
            var user = this.getUser();
            return user ? true : false;
        },

        renderExportLink : function() {
            return this.asyncElement(function(elm) {
                elm.click(_.bind(this.exportClicked, this));
            });
        },

        renderCreateLink : function() {
            return this.asyncElement(function(elm) {
                var that = this;
                var linkController = LinkController.getInstance();
                function updateCreateLink() {
                    var id = that.searchInput.val();
                    console.log('SEARCH Id: ', id);
                    var path = linkController.getLink(id);
                    elm.attr('href', path);
                    return path;
                }
                elm.on('mouseover', updateCreateLink)
                elm.click(function(event) {
                    var path = updateCreateLink();
                    if (path) {
                        that.navigateTo(path);
                        that.searchInput.val('');
                    }
                    event.preventDefault();
                    event.stopPropagation();
                })
            });
        },

        renderTypeahead : function() {
            return this
                    .asyncElement(function(searchInput) {
                        var that = this;
                        that.searchInput = searchInput;
                        var linkController = LinkController.getInstance();
                        var url = linkController
                                .getLink('/api/typeahead?query=%QUERY');
                        var typeahead = that.searchInput.twitterTypeahead({
                            remote : url,
                            limit : 15
                        });
                        typeahead.on('typeahead:selected', function(event,
                                datum) {
                            if (datum && datum.id) {
                                var path = linkController.getLink(datum.id);
                                linkController.navigateTo(path);
                            }
                            that.searchInput.val('');
                        });
                        // var body = $('body');
                        // body.keypress(function(e) {
                        // // http://api.jquery.com/focus-selector/
                        // var $focused = $(document.activeElement);
                        // var tagName = $focused.prop('tagName')
                        // .toLowerCase();
                        // if (tagName == 'body') {
                        // searchInput.focus();
                        // }
                        // });
                        // body.keydown(function(event) {
                        // if (event.altKey) {
                        // if (event.which == 76) {
                        // // alt+L
                        // searchInput.focus();
                        // }
                        // }
                        // });
                    });
        },

        renderPage : function() {
            return this.asyncElement(function(elm) {
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
