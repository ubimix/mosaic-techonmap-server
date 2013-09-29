define([ 'Backbone', 'utils', '../resource/contentView', 'text!../resource/contentView.html' ],

function(Backbone, Utils, ResourceContentView, ResourceContentTemplate) {
    var View = Backbone.View.extend({
        template : _.template(ResourceContentTemplate),
        events : {
            'click .submit' : 'restoreVersion'
        },

        render : function() {
            console.log('revision-view', this.options);
            var contentView = new ResourceContentView(this.options);
            var html = this.template({
                content : contentView.render().$el,
                view : this
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
