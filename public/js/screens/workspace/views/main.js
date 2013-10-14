define([ 'Underscore', '../../commons/UmxView', './resourcelist', './paginator',
        'text!./main.html' ],

function(_, UmxView, ResourceListView, PaginationView, MainViewTemplate) {

    var MainView = UmxView.extend({

        template: _.template(MainViewTemplate),
        
        renderMainView : function() {
            return this.asyncElement(function(elm) {
                if (!this.isLogged()) {
                    var path = this.getLink('/login');
                    this.navigateTo(path);
                    return;
                }

                var view = new ResourceListView({
                    collection : this.collection,
                    workspace : this.options.workspace,
                    sort : this.options.sort,
                    verified : this.options.verified
                });
                elm.append(view.render().el);

                var paginationView = new PaginationView({
                    collection : this.collection
                });

                elm.append(paginationView.render().el);
            });
        },

        isLogged : function() {
            // FIXME:
            return this.options.error ? false : true;
        }

    });

    return MainView;
});
