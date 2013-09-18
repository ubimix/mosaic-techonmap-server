define([ 'Backbone', 'text!./view.html', 'utils' ], function(Backbone, template, Utils) {
    var View = Backbone.View.extend({
        template : _.template(template),
        events : {
            'click .submit' : 'restoreVersion'
        },

        render : function() {
            this.$el.html(this.template({
                resource : this.options.resource,
                yaml : Utils.toYaml(this.options.resource),
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
                $('#dialog-restore-ok').modal()
                //TODO: handle errors
            });
        }

    });
    return View;

});
