define([ 'Backbone', 'diff_match_patch', 'text!./view.html', 'utils' ], function(Backbone, DiffMatchPatch, template, Utils) {
    var View = Backbone.View.extend({
        template : _.template(template),
        render : function() {
            this.$el.html(this.template(this.options));

            var dmp = new DiffMatchPatch();

            var text1 = Utils.toYaml(this.options.v1);
            var text2 = Utils.toYaml(this.options.v2);
            dmp.Diff_Timeout = parseFloat(1);
            //TODO: see how to avoid this switch
            var d = dmp.diff_main(text2, text1);
            //d = d.replace('coor','');
            dmp.diff_cleanupSemantic(d);
            var ds = dmp.diff_prettyHtml(d);
            this.$el.find('#outputdiv').html(ds);

            return this;
        }
    });
    return View;

});
