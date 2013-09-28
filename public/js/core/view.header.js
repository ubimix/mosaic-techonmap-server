define([ 'jQuery', 'Backbone', 'BootstrapDropdown', 'Typeahead', 'UmxAppTemplates' ],

function($, Backbone, Dropdown, Typeahead, templates) {
    var View = Backbone.View.extend({
        template : templates['HeaderView'],
        render : function() {
            this.$el.html(this.template(this.options));

            $('.typeahead').typeahead({
                remote : '/api/typeahead/?query=%QUERY',
                limit : 15
            });

            $('body').on('typeahead:selected', function(event, datum) {
                Backbone.history.navigate('/workspace/' + datum.id, true);
            });

            // TODO: check if not adding listener each time the view is rendered
            // $('.type-ahead').typeahead({
            // source : function(query, process) {
            // return $.get('/api/typeahead', {
            // query : query
            // }, function(items) {
            // data = items;
            // return process(_.pluck(items, 'name'));
            // });
            // },
            // updater : function(item) {
            // var found = _.find(data, function(it) {
            // return it.name == item
            // });
            // // console.log('ID: ', nameIdMap[item]);
            // // console.log('Found: ', found.id);
            // $('#resource-id').val(found.id);
            // return item;
            // },
            // items : 20,
            // });
            //
            // $('.type-ahead').keypress(function(e) {
            // if (e.which == 13) {
            // $('#go').click();
            // return false;
            // }
            // });

            $('#go').on('click', function() {
                if ($('#resource-id').val())
                    Backbone.history.navigate('/techonmap/' + $('#resource-id').val(), true);
                else
                    Backbone.history.navigate('/techonmap/search?q=' + $('.type-ahead').val(), true);
            });

            $('body').keypress(function(e) {
                // http://api.jquery.com/focus-selector/
                var $focused = $(document.activeElement);
                var tagName = $focused.prop('tagName').toLowerCase();
                if (tagName == 'body') {
                    $('.typeahead').focus();
                }
            });

            $('body').keydown(function(event) {
                if (event.altKey) {
                    if (event.which == 76) {
                        // alt+L
                        $('.typeahead').focus();
                    }
                }

            });

            return this;
        }
    });
    return View;

});
