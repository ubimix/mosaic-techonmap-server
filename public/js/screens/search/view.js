define([ 'Underscore', 'Backbone', 'text!./view.html' ], function(_, Backbone, template) {
    var View = Backbone.View.extend({
        template : _.template(template),

        events : {
            'click .go' : 'openResource'
        },
        
        render : function() {
            this.$el.html(this.template(this.options));
            var data;
            this.$el.find('.typeahead').typeahead({
                source : function(query, process) {
                    return $.get('/api/typeahead', {
                        query : query
                    }, function(items) {
                        data = items;
                        return process(_.pluck(items, 'name'));
                    });
                },
                updater : function(item) {
                    var found = _.find(data, function(it) {
                        return it.name == item
                    });
                    // console.log('ID: ', nameIdMap[item]);
                    // console.log('Found: ', found.id);
                    $('#resource-id').val(found.id);
                    return item;
                }
            });

            return this;
        },
        
        openResource : function() {
            // TODO: a link would be better than a button so that the
            // history
            // can be opened in a new tab
            // TODO: use events to switch from one view to the other, so
            // that
            // not all views need to be loaded upfront
            this.remove();
            var path = this.$el.find('#resource-id').val();
            Backbone.history.navigate('/' + this.options.workspace + '/' + path, true);

            return false;
        },

        
    });
    return View;

});
