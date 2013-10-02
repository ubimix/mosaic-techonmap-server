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
            this.model.save(null, function(updatedModel) {
                success: $('#dialog-restore-ok').modal()

            });

            // var version = this.$el.find('#version').val();
            // $.ajax({
            // type : 'PUT',
            // url : '/api/resources/' + this.options.path,
            // data : this.options.resource
            // }).done(function(msg) {
            // $('#dialog-restore-ok').modal()
            // // TODO: handle errors
            // });
        }

    });
    return View;

});
