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
                    evaluate : /\{\{(.+?)\}\}/gim,
                    interpolate : /\{\{=(.+?)\}\}/gim,
                    escape : /\{\{-(.+?)\}\}/gim
                };
                return _;
            }
        }
    },

    paths : {
        jQuery : './../components/jquery/jquery',
        jQueryCsv : './../components/jquery-csv/src/jquery.csv',
        Underscore : './../components/underscore/underscore',
        text : './../components/requirejs-text/text',
        moment : './../components/momentjs/min/moment-with-langs'
    }
});
