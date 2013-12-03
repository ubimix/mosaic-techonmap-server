require.config({
    paths : {
        jQuery : './../components/jquery/jquery',
        Backbone : './../components/backbone/backbone',
        Underscore : './../components/underscore/underscore',
        text : './../components/requirejs-text/text',
        moment : './../components/momentjs/min/moment-with-langs'
    },
    shim : {
        'jQuery' : {
            exports : '$'
        },

        'jQueryCsv' : {
            exports : '$.csv',
            deps : [ 'jQuery' ]
        },

        'Backbone' : {
            deps : [ 'Underscore', 'jQuery' ],
            exports : 'Backbone'
        },

        'Underscore' : {
            exports : '_',
            init : function() {
                this._.templateSettings = {
                    evaluate : /\{\{(.+?)\}\}/gim,
                    interpolate : /\{\{=(.+?)\}\}/gim,
                    escape : /\{\{-(.+?)\}\}/gim
                };
                return _;
            }
        }
    }
});
