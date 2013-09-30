define([ 'Backbone', 'utils', '../resource/contentView', 'text!./view.html' ],

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
                model : this.model
            });
            var html = this.template({
                content : contentView.render().$el,
                model : this.model
            })
            this.$el.html(html);
            return this;
        },

        restoreVersion : function() {
            var version = this.$el.find('#version').val();
            $.ajax({
                type : 'PUT',
                url : '/api/resources/' + this.options.path,
                data : this.options.resource
            }).done(function(msg) {
                $('#dialog-restore-ok').modal()
                // TODO: handle errors
            });
        }

    });
    return View;

});
