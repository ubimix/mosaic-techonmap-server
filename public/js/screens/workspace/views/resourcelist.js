define([ 'Backbone', './resourcerow', 'text!./resourcelist.html' ], function(Backbone, ResourceRowView, template) {

    var View = Backbone.View.extend({
        template : _.template(template),

        initialize : function() {
            this.subviews = [];
        },
        
        //TODO: use backgrid.js ?

        render : function() {
            this.$el.html(this.template(this.options));

            var resourceElt = this.$('.resources');
            this.collection.forEach(function(resource) {
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