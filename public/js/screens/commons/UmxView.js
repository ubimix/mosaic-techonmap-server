define([ 'Underscore', 'Backbone', './LinkController' ],

function(_, Backbone, LinkController) {
    // Trigger an event and/or a corresponding method name. Examples:
    //
    // `this.triggerMethod("foo")` will trigger the "foo" event and
    // call the "onFoo" method.
    //
    // `this.triggerMethod("foo:bar") will trigger the "foo:bar" event and
    // call the "onFooBar" method.
    // MK: copy/paste from Marionette.triggerMethod
    var triggerMethod = (function() {

        // split the event name on the :
        var splitter = /(^|:)(\w)/gi;

        // take the event section ("section1:section2:section3")
        // and turn it in to uppercase name
        function getEventName(match, prefix, eventName) {
            return eventName.toUpperCase();
        }

        // actual triggerMethod name
        var triggerMethod = function(event) {
            // get the method name from the event name
            var methodName = 'on' + event.replace(splitter, getEventName);
            var method = this[methodName];

            // trigger the event, if a trigger method exists
            if (_.isFunction(this.trigger)) {
                this.trigger.apply(this, arguments);
            }

            // call the onMethodName if it exists
            if (_.isFunction(method)) {
                // pass all arguments, except the event name
                return method.apply(this, _.tail(arguments));
            }
        };

        return triggerMethod;
    })();

    var View = Backbone.View.extend();
    _.extend(View.prototype, {
        triggerMethod : triggerMethod,
        renderDefault : function(el) {
            console.log('[WARN] [' + el.attr('data-render')
                    + ']: Renderer method not found. View: ', el)
        },
        renderedDefault : function(el) {
            console.log('[WARN] [' + el.attr('data-rendered')
                    + ']: Method called after the rendering process '
                    + 'is not defined. View: ', el)
        },
        doCallReferencedMethod : function(elm, fieldName, defaultMethodName) {
            var result = null;
            var methodName = elm.attr(fieldName);
            if (methodName) {
                elm.removeAttr(fieldName);
                var method = this[methodName] || this[defaultMethodName];
                if (method) {
                    result = method.call(this, elm);
                }
            }
            return result;
        },
        doRenderElement : function(elm, render, list) {
            var visit = true;
            if (render !== false) {
                var result = this.doCallReferencedMethod(elm, 'data-render',
                        'renderDefault');
                visit = result !== false;
                if (elm.attr('data-rendered')) {
                    list.push(elm);
                }
            }
            if (visit) {
                var children = _.toArray(elm.children());
                _.each(children, function(elm) {
                    this.doRenderElement($(elm), true, list);
                }, this)
            }
            this.triggerMethod('render');
        },
        renderElement : function(elm, render) {
            var list = [];
            this.doRenderElement(elm, render, list);
            // Notify about the end of the rendering process
            _.each(list, function(e) {
                this.doCallReferencedMethod(e, 'data-rendered',
                        'renderedDefault');
            }, this)
        },
        render : function() {
            if (this.template) {
                var html = this.template({
                    view : this
                })
                this.$el.html(html);
            }
            this.renderElement(this.$el);
            return this;
        },

        navigateTo : function(path) {
            var linkController = LinkController.getInstance();
            return linkController.navigateTo(path);
        },

        getLink : function(path) {
            var linkController = LinkController.getInstance();
            return linkController.getLink(path);
        },

        toHistoryLink : function(path, v1, v2) {
            var linkController = LinkController.getInstance();
            return linkController.toHistoryLink(path, v1, v2);
        },

        doRenderHistoryLink : function(a, path, version1, version2) {
            var linkController = LinkController.getInstance();
            path = linkController.toHistoryLink(path, version1, version2);
            this._setLinkAttributes(a, path);
        },

        doRenderLink : function(a, path) {
            path = this.getLink(path);
            this._setLinkAttributes(a, path);
        },
        _setLinkAttributes : function(a, path) {
            a.attr('href', path);
            var that = this;
            a.click(function(event) {
                that.navigateTo(path);
                event.preventDefault();
                event.stopPropagation();
            })
        },

        renderHREF : function(a) {
            this.doRenderLink(a, a.attr('href'));
        },
        renderSRC : function(e) {
            var path = e.attr('src') || e.attr('data-src');
            path = this.getLink(path);
            e.attr('src', path);
        },

        // TODO: remove it
        renderLink : function(path) {
            return this.asyncElement(function(a) {
                this.doRenderLink(a, path);
            })
        }

    });

    return View;

})
