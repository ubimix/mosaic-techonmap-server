define([ 'Backbone', 'diff_match_patch', 'text!./view.html', 'utils' ], function(Backbone, DiffMatchPatch, template, Utils) {
    var View = Backbone.View.extend({
        template : _.template(template),
        render : function() {
            this.$el.html(this.template(this.options));

            var dmp = new DiffMatchPatch();
            var obj1 = Utils.toYaml(this.options.v1);
            var obj2 = Utils.toYaml(this.options.v2)
            var text1 = obj1.content+'\n----\n'+obj1.yaml;
            var text2 = obj2.content+'\n----\n'+obj2.yaml;
            dmp.Diff_Timeout = parseFloat(1);
            // TODO: see how to avoid this switch
            var d = dmp.diff_main(text2, text1);
            // d = d.replace('coor','');
            dmp.diff_cleanupSemantic(d);
            var ds = dmp.diff_prettyHtml(d);
            this.$el.find('#outputdiv').html(ds);

            return this;
        }
    });
    return View;

});
