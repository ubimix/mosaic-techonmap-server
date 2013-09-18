require.config({

    shim : {
        'jQuery' : {
            exports : '$'
        },
        
        'jQueryCsv' : {
            exports : '$.csv'
        },

        'Underscore' : {
            exports : '_',
            init : function() {
                this._.templateSettings = {
                    evaluate : /\{\{(.+?)\}\}/g,
                    interpolate : /\{\{=(.+?)\}\}/g,
                    escape : /\{\{-(.+?)\}\}/g
                };
                return _;
            }
        },

        'Backbone' : {
            deps : [ 'Underscore', 'jQuery' ],
            exports : 'Backbone'
        },

        'ApplicationRouter' : {
            deps : [ 'jQuery', 'Underscore', 'Backbone' ]
        },

        'diff_match_patch' : {
            exports : 'diff_match_patch'
        },

        'yaml' : {
            exports : 'YAML'
        },

        'BootstrapModal' : {
            exports : 'BootstrapModal'
        },

        'BootstrapTypeahead' : {
            //TODO: why does it work
            exports : 'BootstrapTypeahead'
        }

    },

    paths : {
        jQuery : './../components/jquery/jquery',
        jQueryCsv : './../components/jquery-csv/src/jquery.csv',
        Underscore : './../components/underscore/underscore',
        Backbone : './../components/backbone/backbone',
        i18nprecompile : './../components/require-handlebars-plugin/hbs/i18nprecompile',
        json2 : './../components/require-handlebars-plugin/hbs/json2',
        text : './../components/requirejs-text/text',
        diff_match_patch : './../components/diff-match-patch/diff_match_patch',
        yaml : './../components/yamljs/bin/yaml',
        BootstrapModal : './../components/bootstrap/js/bootstrap-modal',
        moment : './../components/momentjs/moment',
        BootstrapTypeahead : './../components/bootstrap/js/bootstrap-typeahead'
    }
});

require([ 'core/router', 'core/client', 'Backbone' ], function(Router, client, Backbone) {
    var app = {
        root : '/'
    };

    window.Router = new Router();
    client.setup(window, app);

    Backbone.history.start({
        pushState : true
    });
});