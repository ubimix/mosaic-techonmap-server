define([ 'Underscore', '../../../commons/UmxView', './resourcelist',
        'text!./main.html' ],

function(_, UmxView, ResourceListView, MainViewTemplate) {

    var MainView = UmxView.extend({

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
        }
    });

    return MainView;
});
