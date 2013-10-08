define([ 'Backbone', 'utils', 'text!./view.html' ],

function(Backbone, Utils, template) {

    var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
    var View = Backbone.View.extend({
        template : _.template(template),
        render : function() {
            this.$el.html(this.template({
                model : this.model,
                history : this.options.history.attributes,
                workspace : this.options.workspace,
                view : this
            }));

            var $hCol1 = this.$el.find('.history td:first-child');
            toggleCompareCheckboxes();
            // TODO: mention jingo
            $hCol1.find('input').on('click', function() {
                toggleCompareCheckboxes();
            });

            var self = this;

            this.$('.compare').attr('disabled', 'disabled');
            this.$el.find('.compare').on(
                    'click',
                    function() {
                        if ($hCol1.find(':checked').length < 2) {
                            return false;
                        }

                        var xx = $hCol1.find(':checked').map(function() {
                            return $(this).val();
                        }).toArray().join('/with/');
                        // TODO: is this really needed ?
                        self.remove();
                        Backbone.history.navigate('/' + self.options.workspace + '/' + self.model.getPath() + '/history/compare/'
                                + xx, true);
                        return false;
                    });

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

            return this;
        },

        getFormattedRevisionDate : function(timestamp) {
            return Utils.formatDate(timestamp);
        }
    });
    return View;

});
