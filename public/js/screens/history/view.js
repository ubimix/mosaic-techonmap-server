define([ 'Underscore', '../commons/UmxView', 'utils', 'text!./view.html' ],

function(_, UmxView, Utils, template) {

    var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
    var View = UmxView.extend({
        template : _.template(template),
        getHistory : function() {
            return this.options.history.attributes;
        },
        renderCompareButton : function() {
            return this.asyncElement(function(btn) {
                btn.attr('disabled', 'disabled');
                var self = this;
                btn.on('click', function() {
                    var $hCol1 = self.tableElm.find('td:first-child');
                    if ($hCol1.find(':checked').length < 2) {
                        return false;
                    }

                    var xx = $hCol1.find(':checked').map(function() {
                        return $(this).val();
                    }).toArray().join('/with/');
                    // TODO: is this really needed ?
                    self.remove();

                    var href = self.getLink(self.model.getPath()
                            + '/history/compare/' + xx);
                    self.navigateTo(href);
                    return false;
                });

            })
        },
        postprocess : function() {
            return this.asyncElement(function(elm) {
                this.tableElm = elm;
                var $hCol1 = this.tableElm.find('td:first-child');
                toggleCompareCheckboxes();
                // TODO: mention jingo
                $hCol1.find('input').on('click', function() {
                    toggleCompareCheckboxes();
                });

                var self = this;
                function toggleCompareCheckboxes() {
                    if ($hCol1.find(':checkbox').length == 1) {
                        $hCol1.find(':checkbox').hide();
                        $('#rev-compare').hide();
                        return;
                    }
                    if ($hCol1.find(':checked').length == 2) {
                        $hCol1.find(':not(:checked)').hide();
                        $hCol1.parent('tr').css({
                            'color' : 'silver'
                        });
                        $hCol1.find(':checked').parents('tr').css({
                            'color' : 'black'
                        });
                        this.$('.compare').removeAttr('disabled');
                    } else {
                        $hCol1.find('input').show().parents('tr').css({
                            'color' : 'black'
                        });
                        this.$('.compare').attr('disabled', 'disabled');
                    }
                }
            });
        },
        getFormattedRevisionDate : function(timestamp) {
            return Utils.formatDate(timestamp);
        }
    });
    return View;

});
