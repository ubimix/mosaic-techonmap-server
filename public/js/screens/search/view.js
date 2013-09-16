define([ 'Underscore', 'Backbone', 'text!./view.html' ], function(_, Backbone, template) {
    var View = Backbone.View.extend({
        template : _.template(template),
        render : function() {
            this.$el.html(this.template(this.options));
            return this;
        }
    });
    return View;

});
