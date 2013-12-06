define([ 'Underscore', 'Backbone', '../models/LinkController',
        './AppRouter' ],

function(_, Backbone, LinkController, AppRouter) {
    var app = {
        root : '/'
    };
    var sync = Backbone.sync;
    var linkController = LinkController.getInstance();
    var ACL_URL = linkController.getLink('/api/validation');
    var AccessInfo = Backbone.Model.extend({
        isLoaded : false,
        url : ACL_URL,
        getData : function() {
            return this.data;
        },
        load : function(callback) {
            var that = this;
            sync.call(this, 'read', this, {
                url : this.url,
                success : function(data) {
                    that.data = data;
                    callback(data, null);
                },
                error : function() {
                    var array = _.toArray(arguments);
                    callback(null, array);
                }
            })
        }
    });
    var sync = Backbone.sync;
    var accessInfo = null;
    Backbone.sync = function(method, model, options) {
        var that = this;
        var args = _.toArray(arguments);
        if (!accessInfo) {
            var access = new AccessInfo();
            access.load(function(data, errorArray) {
                if (errorArray == null) {
                    accessInfo = access;
                    sync.call(this, method, model, options);
                } else {
                    var error = errorArray[0]
                    if (error.status == 403) {
                        var linkController = LinkController.getInstance();
                        linkController.navigateTo('/login');
                    }
                    options.error.apply(this, errorArray);
                }
            })
        } else {
            if (options.url == ACL_URL) {
                options.success.call(that, 'success', accessInfo.getData());
            } else {
                sync.apply(that, args)
            }
        }
    }

    return function() {
        window.AppRouter = new AppRouter({
            el : $('body')
        });
        $(window.document).on(
                "click",
                "a[href]:not([data-bypass])",
                function(evt) {
                    var href = {
                        prop : $(this).prop("href"),
                        attr : $(this).attr("href")
                    };
                    var root = win.location.protocol + "//" + win.location.host
                            + app.root;

                    // TODO: see if there is a better way (possibly with
                    // 'data-bypass' ?)
                    if (href.attr.indexOf('/api/') == 0
                            || href.attr.indexOf('/map/') == 0) {
                        return;
                    }

                    if (href.prop.slice(0, root.length) === root) {
                        evt.preventDefault();
                        Backbone.history.navigate(href.attr, true);
                    }
                });
        Backbone.pubSub = _.extend({}, Backbone.Events);
        Backbone.history.start({
            pushState : true
        });
    }
})
