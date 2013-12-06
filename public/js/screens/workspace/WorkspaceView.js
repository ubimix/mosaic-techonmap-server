define([ 'Underscore', '../../commons/TemplateView', './ResourceListView',
        './PaginationView', 'text!./WorkspaceView.html' ],

function(_, TemplateView, ResourceListView, PaginationView, MainViewTemplate) {

    var WorkspaceView = TemplateView.extend({

        template : _.template(MainViewTemplate),

        renderMainView : function(elm) {
            // console.log('[MAIN VIEW] BEFORE')
        },
        renderedMainView : function(elm) {
            // console.log('[MAIN VIEW] AFTER')
        },

        renderResourceList : function(elm) {
            var view = new ResourceListView({
                collection : this.collection,
                workspace : this.options.workspace,
                sort : this.options.sort,
                verified : this.options.verified
            });
            elm.append(view.render().el);
        },

        renderPaginator : function(elm) {
            var paginationView = new PaginationView({
                collection : this.collection
            });
            elm.append(paginationView.render().el);
        }

    });

    return WorkspaceView;
});
