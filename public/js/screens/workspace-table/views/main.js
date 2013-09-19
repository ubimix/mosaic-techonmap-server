define([ 'Backbone', './resourcelist' ], function(Backbone, ResourceListView) {

    var MainView = Backbone.View.extend({
        initialize : function() {
            this.subviews = [];
        },

        render : function() {
            if (this.options.error) {
                this.$el.append('You are not authorized to perform this action. Please <a href="/login">login</a>.');
            } else {

                var view = new ResourceListView({
                    collection : this.collection,
                    workspace : this.options.workspace,
                    sort : this.options.sort
                });
                this.$el.append(view.render().el);
                this.subviews.push(view);
                
                
            }
            return this;
        }
    });

    return MainView;
});
