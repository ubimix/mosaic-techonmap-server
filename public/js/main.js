require.config({

    shim : {
        'jQuery' : {
            exports : '$'
        },

        'jQueryCsv' : {
            exports : '$.csv',
            deps : [ 'jQuery' ]
        },

        'BootstrapGrowl' : {
            deps : [ 'jQuery' ]

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

        'BackbonePaginator' : {
            deps : [ 'Backbone' ],
            exports : 'Backbone.Paginator'
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

        // TODO: which export
        'BootstrapModal' : {
            exports : 'BootstrapModal',
            deps : [ 'jQuery' ]
        },
        'BootstrapDropdown' : {
            exports : 'BootstrapDropdown',
            deps : [ 'jQuery' ]
        },

        'Typeahead' : {
            deps : [ 'jQuery' ]
        },
        'CodeMirror' : {
            exports : 'CodeMirror'
        },
        'CodeMirrorYaml' : {
            deps : [ 'CodeMirror', ]
        }
    },

    paths : {
        jQuery : './../components/jquery/jquery',
        jQueryCsv : './../components/jquery-csv/src/jquery.csv',
        jQueryToast : './../components/jquery-toast/jquery.toast',
        Underscore : './../components/underscore/underscore',
        Backbone : './../components/backbone/backbone',
        BackbonePaginator : './../components/backbone.paginator/lib/backbone.paginator',
        i18nprecompile : './../components/require-handlebars-plugin/hbs/i18nprecompile',
        json2 : './../components/require-handlebars-plugin/hbs/json2',
        text : './../components/requirejs-text/text',
        diff_match_patch : './../components/diff-match-patch/diff_match_patch',
        yaml : './../components/yamljs/bin/yaml',
        BootstrapModal : './../components/bootstrap/js/modal',
        BootstrapDropdown : './../components/bootstrap/js/dropdown',
        BootstrapGrowl : './../components/bootstrap-growl/jquery.bootstrap-growl',
        Typeahead : './../components/typeahead.js/dist/typeahead',
        moment : './../components/momentjs/moment',
        UmxAppTemplates : './theme-techonmap/umx.app.templates',
        CodeMirror : './../components/codemirror/lib/codemirror',
        CodeMirrorYaml : './../components/codemirror/mode/yaml/yaml'
    }
});

require([ 'core/router', 'core/client', 'Backbone', 'Underscore' ],

function(Router, client, Backbone, _) {
    var app = {
        root : '/'
    };

    window.Router = new Router();
    client.setup(window, app);
    Backbone.pubSub = _.extend({}, Backbone.Events);
    Backbone.history.start({
        pushState : true
    });
});