define([ 'Underscore', '../commons/LinkController', '../commons/UmxView', 'utils', 'text!./view.html' ],

function(_, LinkController, UmxView, Utils, template) {

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

                    var versions = [];
                    $hCol1.find(':checked').map(function() {
                        versions.push($(this).val());
                    });

                    var fullPath = self
                            .getLink(self.model.getPath() + '/history/compare/' + versions[0] + '/with/' + versions[1]);
                    self.navigateTo(fullPath);
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
        },

        renderHistoryLink : function(versionId) {
            return this.asyncElement(function(a) {
                var path = this.model.getPath();
                path = this.toHistoryLink(path, versionId);
                this._setLinkAttributes(a, path);
            })
        }
    });
    return View;

});
