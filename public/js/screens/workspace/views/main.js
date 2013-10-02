define([ 'Backbone', './resourcelist', './paginator' ], function(Backbone, ResourceListView, PaginationView) {

    var MainView = Backbone.View.extend({
        initialize : function() {
            this.subviews = [];
        },

        render : function() {
            if (this.options.error) {
                // this.$el.append('You are not authorized to perform this
                // action. Please <a href="/login">login</a>.');
                Backbone.history.navigate('/login', true);
            } else {

                var view = new ResourceListView({
                    collection : this.collection,
                    workspace : this.options.workspace,
                    sort : this.options.sort,
                    verified : this.options.verified
                });
                this.$el.append(view.render().el);

                var paginationView = new PaginationView({
                    collection : this.collection
                });

                this.$el.append(paginationView.render().el);
                
                //view.$('.sorter').append(paginationView.getSorter());

                this.subviews.push(view);
                this.subviews.push(paginationView);

            }
            return this;
        }
    });

    return MainView;
});
