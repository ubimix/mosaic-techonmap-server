define([ 'Underscore', 'Backbone', 'text!./view.html' ], function(_, Backbone, template) {
    var View = Backbone.View.extend({
        template : _.template(template),
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
                    var found = _.find(data, function(it) { return it.name == item});
                    //console.log('ID: ', nameIdMap[item]);
                    //console.log('Found: ', found.id);
                    $('#resource-id').val(found.id);
                    return item;
                }
            });

            return this;
        }
    });
    return View;

});
