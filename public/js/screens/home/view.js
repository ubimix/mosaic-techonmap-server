define(['Backbone', 'text!./view.html' ], function(Backbone, template) {
    var View = Backbone.View.extend({
        template : _.template(template),
        render : function() {
            this.$el.html(this.template(this.options));
            return this;
        }
    });
    return View;

});
