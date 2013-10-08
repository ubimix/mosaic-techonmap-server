define([ 'jQuery', 'Underscore', 'Backbone', 'Typeahead', 'UmxAppTemplates' ],

function($, _, Backbone, Typeahead, templates) {
    var View = Backbone.View.extend({
        template : templates['HeaderView'],

        render : function() {
            this.$el.html(this.template(this.options));
            var searchInput = this.$el.find('.umx-typeahead');
            var typeahead = searchInput.twitterTypeahead({
                remote : '/api/typeahead/?query=%QUERY',
                limit : 15,
                beforeSend : function(xhqr, settings) {
                    console.log('beforesend', settings);
                },
                filter : function(response) {
                    console.log('response:', response);
                    return response;
                }
            });

            var body = $('body');
            body.on('typeahead:selected', function(event, datum) {
                if (datum && datum.id) {
                    Backbone.history.navigate('/workspace/' + datum.id, true);
                }
                searchInput.val('');
            });
            body.keypress(function(e) {
                // http://api.jquery.com/focus-selector/
                var $focused = $(document.activeElement);
                var tagName = $focused.prop('tagName').toLowerCase();
                if (tagName == 'body') {
                    searchInput.focus();
                }
            });
            body.keydown(function(event) {
                if (event.altKey) {
                    if (event.which == 76) {
                        // alt+L
                        searchInput.focus();
                    }
                }
            });

            return this;
        }
    });
    return View;

});
