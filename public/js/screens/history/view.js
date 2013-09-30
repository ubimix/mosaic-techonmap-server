define([ 'Backbone', 'moment', 'text!./view.html' ], function(Backbone, moment, template) {

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
                } else {
                    $hCol1.find('input').show().parents('tr').css({
                        'color' : 'black'
                    });
                }
            }

            return this;
        },

        getFormattedDate : function(timestamp) {
            if (!timestamp)
                return moment().format(DATE_FORMAT);
            var day = moment(timestamp);
            return day.format(DATE_FORMAT);
        }
    });
    return View;

});
