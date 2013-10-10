define([ 'Backbone', 'utils', '../resource/table-view', 'text!./view.html' ],

function(Backbone, Utils, ResourceContentView, RevisionContainerTemplate) {
    var View = Backbone.View.extend({
        template : _.template(RevisionContainerTemplate),
        events : {
            'click .submit' : 'restoreVersion'
        },

        render : function() {
            // TODO: create a copy ?
            // TODO: to be moved to initialize
            var contentView = new ResourceContentView({
                model : this.model,
                readOnly : true
            });
            var html = this.template({
                model : this.model,
                workspace : this.options.workspace
            })
            this.$el.html(html);
            this.$('#editors').append(contentView.$el);
            contentView.render();

            return this;
        },

        restoreVersion : function() {
            var _this = this;
            this.model.save(null, {
                success : function(updatedModel) {
                    _this.remove();
                    Backbone.history.navigate('/' + _this.options.workspace + '/' + _this.model.getPath() + '/history', true);
                }
            });

        }

    });
    return View;

});
