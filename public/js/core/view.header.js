define([ 'jQuery', 'Backbone', 'BootstrapDropdown', 'Typeahead', 'UmxAppTemplates' ],

function($, Backbone, Dropdown, Typeahead, templates) {
    var View = Backbone.View.extend({
        template : templates['HeaderView'],
        render : function() {
            this.$el.html(this.template(this.options));

            this.$('.umx-typeahead').typeahead({
                remote : '/api/typeahead/?query=%QUERY',
                limit : 15
            });

            // TODO: check if not adding listener each time the view is rendered

            $('body').on('typeahead:selected', function(event, datum) {
                Backbone.history.navigate('/workspace/' + datum.id, true);
                // FIXME:does not work
                $('.umx-typeahead').val('');
            });

            $('body').keypress(function(e) {
                // http://api.jquery.com/focus-selector/
                var $focused = $(document.activeElement);
                var tagName = $focused.prop('tagName').toLowerCase();
                if (tagName == 'body') {
                    $('.umx-typeahead').focus();
                }
            });

            $('body').keydown(function(event) {
                if (event.altKey) {
                    if (event.which == 76) {
                        // alt+L
                        $('.umx-typeahead').focus();
                    }
                }

            });

            return this;
        }
    });
    return View;

});
