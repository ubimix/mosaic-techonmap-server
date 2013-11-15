define(
        [ '../commons/UmxView', 'diff_match_patch', 'text!./view.html', 'utils' ],

        function(UmxView, DiffMatchPatch, template, Utils) {

            var View = UmxView.extend({
                getFormattedRevisionDate : function(timestamp) {
                    return Utils.formatDate(timestamp);
                },
                template : _.template(template),

                renderDiff : function() {
                    return this.asyncElement(function(el) {
                        var dmp = new DiffMatchPatch();
                        var obj1 = Utils
                                .toStructuredContent(this.options.revision1);
                        var obj2 = Utils
                                .toStructuredContent(this.options.revision2)
                        var text1 = obj1.content + '\n----\n' + obj1.yaml;
                        var text2 = obj2.content + '\n----\n' + obj2.yaml;
                        dmp.Diff_Timeout = parseFloat(1);
                        // TODO: see how to avoid this switch
                        var d = dmp.diff_main(text2, text1);
                        // d = d.replace('coor','');
                        dmp.diff_cleanupSemantic(d);
                        var ds = dmp.diff_prettyHtml(d);
                        el.html(ds);
                    })
                },
                getWorkspace : function() {
                    return this.options.workspace;
                },
                getFirstRevision : function() {
                    return this.options.revision1;
                },
                getSecondRevision : function() {
                    return this.options.revision2;
                }
            });
            return View;

        });
