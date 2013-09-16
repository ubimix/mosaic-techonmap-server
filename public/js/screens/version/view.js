define([ 'Backbone', 'text!./view.html' ], function(Backbone, template) {
    var View = Backbone.View.extend({
        template : _.template(template),
        events : {
            'click .submit' : 'restoreVersion'
        },

        render : function() {
            this.$el.html(this.template({
                resource : this.options.resource,
                version : this.options.version,
                workspace : this.options.workspace,
                path : this.options.path
            }));

            return this;
        },

        restoreVersion : function() {
            var version = this.$el.find('#version').val();
            $.ajax({
                type : 'PUT',
                url : '/api/resources/' + this.options.path,
                data : this.options.resource
            }).done(function(msg) {
                //TODO: handle errors
                console.log('Data Saved: ' + msg);
            });
        }

    });
    return View;

});
