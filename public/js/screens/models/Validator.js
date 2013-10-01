define([ 'Backbone' ], function(Backbone) {

    var Validator = Backbone.Model.extend({
        url : '/api/validation/',

        initialize : function() {
            _.bindAll(this, '_onLoad');
            this.fetch({
                success : this._onLoad
            });
        },

        onReady : function(callback) {
            if (this.ready) {
                callback();
            } else {
                this._readyListeners = this._readyListeners || [];
                this._readyListeners.push(callback);
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
        },

        isValidated : function(resource) {
            var version = resource.getUpdated();
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
            this.save({
                success : this._onLoad
            });

        },

        validateAll : function() {
            var props = this._getProperties();
            props.validated = [];
            props.timestamp = new Date().getTime();
            this.save({
                success : this._onLoad
            })
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

    Validator.getInstance = function() {
        if (!Validator.instance) {
            Validator.instance = new Validator();
        }
        return Validator.instance;
    }

    return Validator;
})