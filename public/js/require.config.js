require
        .config({
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
                'BootstrapTooltip' : {
                    exports : 'BootstrapTooltip',
                    deps : [ 'jQuery' ]
                },
                'BootstrapPopover' : {
                    exports : 'BootstrapPopover',
                    deps : [ 'jQuery', 'BootstrapTooltip' ]
                },
                'Typeahead' : {
                    exports : 'Typeahead',
                    deps : [ 'jQuery' ],
                    init : function() {
                        jQuery.fn.twitterTypeahead = jQuery.fn.typeahead;
                        return jQuery.fn.twitterTypeahead;
                    }
                },

                // Fake dependency to force Handsontable to be loaded after
                // Typeahead
                'Handsontable' : {
                    exports : 'Handsontable',
                    deps : [ 'jQuery', 'Typeahead' ]
                },
                'CodeMirror' : {
                    exports : 'CodeMirror'
                },
                'CodeMirrorYaml' : {
                    deps : [ 'CodeMirror' ]
                },
                'Leaflet' : {
                    exports : 'L'
                },
                'Xeditable' : {
                    deps : [ 'jQuery', 'BootstrapPopover' ],
                    init : function() {
                        jQuery.fn.editable.defaults.mode = 'inline';
                        return jQuery.fn.editable;
                    }
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
                Typeahead : './../components/typeahead.js/dist/typeahead',
                BootstrapModal : './../components/bootstrap/js/modal',
                BootstrapDropdown : './../components/bootstrap/js/dropdown',
                BootstrapTooltip : './../components/bootstrap/js/tooltip',
                BootstrapPopover : './../components/bootstrap/js/popover',
                BootstrapGrowl : './../components/bootstrap-growl/jquery.bootstrap-growl',
                moment : './../components/momentjs/min/moment-with-langs',
                UmxAppTemplates : './theme-techonmap/umx.app.templates',
                CodeMirror : './../components/codemirror/lib/codemirror',
                CodeMirrorYaml : './../components/codemirror/mode/yaml/yaml',
                Handsontable : './../components/handsontable/dist/jquery.handsontable.full',
                Leaflet : './../components/leaflet-dist/leaflet',
                Xeditable : './../components/x-editable/dist/bootstrap3-editable/js/bootstrap-editable'
            }
        });
