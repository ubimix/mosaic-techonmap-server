define([ 'jQuery', 'Underscore', 'Backbone', '../screens/commons/UmxView', 'Typeahead', '../screens/commons/LinkController',
        'text!./view.header.html', '../screens/commons/Dialog', '../screens/export/Export', 'BootstrapDropdown' ],

function($, _, Backbone, UmxView, Typeahead, LinkController, ViewHeaderTemplate, Dialog, ExportDialog) {

    var View = UmxView.extend({

        template : _.template(ViewHeaderTemplate),

        getUser : function() {
            return this.options.user;
        },

        isLogged : function() {
            var user = this.getUser();
            return user && user != 'Anonymous' ? true : false;
        },

        renderMainView : function() {
            return this.asyncElement(function(elm) {
                if (this.isLogged()) {
                    elm.show();
                } else {
                    elm.hide();
                }
            });
        },

        renderExportLink : function() {
            return this.asyncElement(function(elm) {
                elm.click(_.bind(this.exportClicked, this));
            });
        },

        renderCreateDialog : function() {
            return this.asyncElement(function(elm) {
                this.createDialogElm = elm;
                elm.remove();
            })
        },

        renderCreateLink : function() {
            return this.asyncElement(function(elm) {
                var that = this;
                var linkController = LinkController.getInstance();
                function isEmpty(str) {
                    return !str || str == '';
                }
                function updateCreateLink(id) {
                    var path = null;
                    if (!isEmpty(id)) {
                        path = linkController.getLink(id);
                        elm.attr('href', path);
                    }
                    return path;
                }
                function redirectToPage(path) {
                    if (!isEmpty(path)) {
                        that.navigateTo(path);
                        that.searchInput.val('');
                    }
                }
                elm.on('mouseover', function() {
                    updateCreateLink(that.searchInput.val());
                })
                elm.click(function(event) {
                    var path = updateCreateLink(that.searchInput.val());
                    if (isEmpty(path)) {
                        var createDialog = new Dialog({
                            title : that.createDialogElm.find('.title').text(),
                            content : that.createDialogElm.find('.content').html(),
                            actions : [ {
                                label : that.createDialogElm.find('.btn-ok').text(),
                                primary : true,
                                action : function() {
                                    path = createDialog.$el.find('input').val();
                                    path = updateCreateLink(path);
                                    redirectToPage(path);
                                    createDialog.hide();
                                }
                            }, {
                                label : that.createDialogElm.find('.btn-cancel').text(),
                                action : function() {
                                    createDialog.hide();
                                }
                            } ]
                        });
                        var input = createDialog.$el.find('input');
                        input.on('keyup', function(ev) {
                            alert(ev)
                        })
                        createDialog.show();
                        input.focus();
                    } else {
                        redirectToPage(path);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                })
            });
        },

        renderTypeahead : function() {
            return this.asyncElement(function(searchInput) {
                var that = this;
                that.searchInput = searchInput;
                var linkController = LinkController.getInstance();
                var url = linkController.getLink('/api/typeahead?query=%QUERY');
                var typeahead = that.searchInput.twitterTypeahead({
                    remote : url,
                    limit : 15
                });
                typeahead.on('typeahead:selected', function(event, datum) {
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
