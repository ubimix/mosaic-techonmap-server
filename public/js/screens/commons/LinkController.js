define([ 'Underscore', 'Backbone' ], function(_, Backbone) {

    var LinkController = Backbone.Model.extend({

        navigateTo : function(path) {
            console.log('navigateTo:', path);
            Backbone.history.navigate(path, true);
        },

        getLink : function(path) {
            if (!path)
                path = '';
            path = path.replace(/[\\\/]+/gim, '/').replace(/\s+/, '').replace(
                    /^\//g, '').replace(/\/$/gi, '');
            // FIXME: is it really required ?
            if (path.indexOf('api/') == 0) {
                path = '/' + path;
            } else {
                path = '/workspace/' + path;
            }
            return path;
        },

        _prepareHistoryLink : function(path, version1, version2) {
            var str = path + '/history';
            if (version1) {
                str += '/' + version1;
                if (version2) {
                    str += '/' + version2;
                }
            }
            return str;
        },

        getHistoryLink : function(path, version1, version2) {
            str = this._prepareHistoryLink(path, version1, version2);
            return this.getLink(str);
        },

        isNewResourcePath : function(path) {
            return path == 'new';
        },

        getApiVersionLink : function(path, version1, version2) {
            str = this._prepareHistoryLink(path, version1, version2);
            return this.getApiLink(str);
        },

        getApiLink : function(path) {
            return this.getLink('/api/resources/' + path);
        },
        getApiTypeaheadLink : function() {
            return this.getLink('/api/typeahead');
        },
    }, {
        getInstance : function() {
            if (!LinkController._instance) {
                LinkController._instance = new LinkController();
            }
            return LinkController._instance;
        }
    });
    return LinkController;

})
