define([ 'Backbone', './resourcerow', 'text!./resourcelist.html' ], function(Backbone, ResourceRowView, template) {

    var View = Backbone.View.extend({
        template : _.template(template),

        initialize : function() {
            this.subviews = [];
        },

        events : {
            'click .sort' : 'render'
        },

        // TODO: use backgrid.js ?

        render : function() {
            // TODO add loading indicator
            // TODO: do we need to remove the view when rendering it again ?
            this.$el.html(this.template(this.options));

            var resourceElt = this.$('.resources');
            var sortField = 'sys.updated.timestamp';
            if (this.options.sort)
                sortField = this.options.sort;
            var sortProperty = sortField.split('.');
            var models = _.sortBy(this.collection.models, function(resource) {
                return resource.attributes[sortProperty[0]][sortProperty[1]];
            });

            if (sortField == 'sys.updated.timestamp')
                models.reverse();

            models.forEach(function(resource) {
                var view = new ResourceRowView({
                    model : resource,
                    workspace : this.options.workspace
                });
                resourceElt.append(view.render().el);
                this.subviews.push(view);
            }, this);

            return this;
        }

    });

    return View;
});