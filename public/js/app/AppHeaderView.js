define([ 'jQuery', 'Underscore', 'Backbone', '../screens/commons/UmxView',
        'Typeahead', '../screens/commons/LinkController',
        'text!./AppHeaderView.html', '../screens/commons/Dialog',
        '../screens/export/Export', 'BootstrapDropdown' ],

function($, _, Backbone, UmxView, Typeahead, LinkController,
        AppHeaderViewTemplate, Dialog, ExportDialog) {

    var View = UmxView.extend({

        template : _.template(AppHeaderViewTemplate),

        getUser : function() {
            return this.options.user;
        },

        _loadUserInfo : function(callback) {
            var that = this;
            if (!that.user) {
                if (that._userInfoListeners) {
                    that._userInfoListeners.push(callback);
                } else {
                    that._userInfoListeners = [];
                    that._userInfoListeners.push(callback);
                    var setUser = function(user) {
                        that.user = user;
                        _.each(that._userInfoListeners, function(listener) {
                            try {
                                listener.call(that, that.user);
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }
                    var linkController = LinkController.getInstance();
                    var url = linkController.getLink('/api/auth/user');
                    $.getJSON(url, setUser).error(function(err) {
                        console.log('ERROR!', err);
                        setUser({
                            roles : []
                        })
                    });
                }
            } else {
                callback.call(that, that.user);
            }
        },

        _isLogged : function(user) {
            return user && user.id && user.id != 'Anonymous' ? true : false;
        },

        _isPowerUser : function(user) {
            if (!this._isLogged(user))
                return false;
            var result = false;
            _.each(user.userRoles, function(role) {
                result |= (role == 'owner') || (role == 'admin');
            })
            return result;
        },

        renderUserInfoBlock : function(elm) {
            elm.hide();
            this._loadUserInfo(function(user) {
                if (this._isLogged(user)) {
                    elm.show();
                } else {
                    elm.remove();
                }
            })
        },

        renderToolBox : function(elm) {
            elm.hide();
            this._loadUserInfo(function(user) {
                if (this._isPowerUser(user)) {
                    elm.show();
                } else {
                    elm.remove();
                }
            })
        },

        renderUserName : function(elm) {
            var usr = this.getUser();
            elm.html(usr);
        },

        renderExportLink : function(elm) {
            elm.click(_.bind(this.exportClicked, this));
        },

        renderCreateDialog : function(elm) {
            this.createDialogElm = elm;
            elm.remove();
        },

        renderCreateLink : function(elm) {
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
                        actions : [
                                {
                                    label : that.createDialogElm
                                            .find('.btn-ok').text(),
                                    primary : true,
                                    action : function() {
                                        path = createDialog.$el.find('input')
                                                .val();
                                        path = updateCreateLink(path);
                                        redirectToPage(path);
                                        createDialog.hide();
                                    }
                                },
                                {
                                    label : that.createDialogElm.find(
                                            '.btn-cancel').text(),
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
        },

        renderTypeahead : function(searchInput) {
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
