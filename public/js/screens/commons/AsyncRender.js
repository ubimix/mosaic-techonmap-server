define([ 'Underscore' ],

function(_) {
    /**
     * This mixin allows to fill template elements asynchronously using
     * specified handlers.
     * 
     * <pre>
     * Example:
     *  
     * Template element to handle:
     *    &lt;p &lt;%=view.renderDescription()%&gt; &gt;Loading...&lt;/p&gt;
     *    
     * View:
     *   ...
     *   renderDescription: function() {
     *      // Returns an identifier used to find a paragraph
     *      // defined in the template.
     *      return this.asyncElement(function(paragraph){
     *          // Now the paragraph defined in the template is available
     *          // as a DOM element. So we can use it to change its content.
     *          paragraph.html(this.model.get('description'));
     *      });
     *   } 
     * </pre>
     */
    var AsyncRender = function() {
    };
    _.extend(AsyncRender.prototype, {

        /**
         * This method loads all async elements and calls the corresponding
         * handlers. This method should be called after template transformation
         * into a DOM element hierarchy (after template rendering).
         */
        callAsyncHandlers : function(el) {
            var $el = $(el);
            var handlers = this._asyncElementHandlers || {};
            this._asyncElementHandlers = {};
            _.each(handlers, function(handler, id) {
                var elm = $el.find('#' + id);
                handler.call(this, elm);
            }, this);
        },

        /**
         * This is an internal method registering a new element handler. It
         * returns a newly created identifier which should be associated with an
         * element to handle. This method is used internally to generate new
         * "async" elements or generate unique IDs elements defined in
         * templates.
         */
        _registerAsyncHandler : function(handler) {
            if (!this._asyncElementHandlers) {
                this._asyncElementHandlers = {};
            }
            var id = _.uniqueId('id-');
            this._asyncElementHandlers[id] = handler;
            return id;
        },

        /**
         * Creates and returns a new identifier element attribute. This method
         * should be used to associate an async handler with an element defined
         * in a template.
         */
        asyncElement : function(handler) {
            var id = this._registerAsyncHandler(handler);
            return ' id="' + id + '"';
        },

        /**
         * Transforms the specified promise into an async element handler. The
         * specified "valueHandler" function takes three parameters: 1) the
         * element to handle 2) result of the promise execution; null if there
         * is an error 3) error of the promise execution; and null if there is
         * no errors;
         */
        getPromiseHandler : function(promise, valueHandler) {
            var that = this;
            return function(elm) {
                promise.then(function(value) {
                    valueHandler.call(that, elm, value, null);
                }, function(error) {
                    valueHandler.call(that, elm, null, error);
                });
            }
        },

        /**
         * Creates and returns a new identifier for a template element which
         * should be handled by the given promise handler. The specified promise
         * handler takes the following parameters: 1) the element to handle 2)
         * result of the promise execution or null if there is an error 3) error
         * of the promise execution; and null if there is no errors
         * 
         */
        promisedElement : function(promise, handler) {
            return this.asyncElement(this.getPromiseHandler(promise, handler));
        }
    })

    return AsyncRender;

});
