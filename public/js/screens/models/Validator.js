define([ 'Backbone', '../commons/LinkController' ],
//
function(Backbone, LinkController) {

    var Validator = Backbone.Model.extend({

        initialize : function() {
        },

        url : function() {
            var linkController = LinkController.getInstance();
            var link = linkController.getLink('/api/validation');
            return link;
        },

        initialize : function() {
            _.bindAll(this, '_onLoad', '_onFailure');
            this._resultHandlers = {
                success : this._onLoad,
                error : this._onFailure
            };
            this.fetch(this._resultHandlers);
        },

        onReady : function(callback) {
            if (this.ready) {
                callback();
            } else {
                this._readyListeners = this._readyListeners || [];
                this._readyListeners.push(callback);
            }
        },

        _onFailure : function(obj, err) {
            console.log('ERROR:', arguments);
            if (err.status == 403) {
                var linkController = LinkController.getInstance();
                linkController.navigateTo('/login');
            }
        },

        _onLoad : function() {
            var list = this._getValidatedResources();
            _.sortBy(list, function(value) {
                return value || '';
            });
            if (!this.ready) {
                if (this._readyListeners) {
                    _.each(this._readyListeners, function(method) {
                        method();
                    })
                }
                this._readyListeners = null;
                this.ready = true;
            }
            this.trigger('loaded');
        },

        wasUpdated : function(resource) {
            return !this._checkResource(resource, resource.getUpdated());
        },

        // returns true if the resource has been created after the last
        // validation timestamp
        wasCreated : function(resource) {
            return !this._checkResource(resource, resource.getCreated());
        },

        isValidated : function(resource) {
            return !this.wasUpdated(resource) && !this.wasCreated(resource);
        },

        _checkResource : function(resource, version) {
            var versionTimestamp = version.timestamp || 0;
            var timestamp = this._getTimestamp();
            if (timestamp > versionTimestamp)
                return true;
            var path = resource.getPath();
            var idx = _.indexOf(this._getValidatedResources(), path);
            return idx >= 0;
        },

        validateResources : function(resources) {
            _.each(resources, function(resource) {
                var path = resource.getPath();
                var validated = this._getValidatedResources();
                if (_.indexOf(validated, path) < 0) {
                    var idx = _.sortedIndex(validated, path);
                    validated.splice(idx, 0, path);
                }
            }, this);

            this.save(null, this._resultHandlers);

        },

        validateAll : function() {
            var props = this._getProperties();
            props.validated = [];
            props.timestamp = new Date().getTime();
            this.save(null, this._resultHandlers)
        },

        _getTimestamp : function() {
            return this._getProperties().timestamp || 0;
        },

        _getProperties : function() {
            var props = this.get('properties');
            if (!props) {
                props = {};
                this.set('properties', props);
            }
            return props;
        },

        _getValidatedResources : function() {
            var props = this._getProperties();
            var list = props.validated = props.validated || [];
            return list;
        }

    });

    Validator.clearInstance = function() {
        delete Validator.instance;
    }

    Validator.getInstance = function() {
        if (!Validator.instance) {
            Validator.instance = new Validator();
        }
        return Validator.instance;
    }

    return Validator;
})