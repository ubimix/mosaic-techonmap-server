define([ 'Underscore', '../commons/LinkController', '../commons/UmxView',
        'utils', 'text!./view.html' ],

function(_, LinkController, UmxView, Utils, template) {

    var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

    var HistoryView = UmxView.extend({
        template : _.template(template),
        initialize : function() {
            this.versionPositions = {};
            this.selectedVersionIds = {};
        },
        getHistory : function() {
            return this.options.history.attributes;
        },

        renderRef : function(elm) {
            this.doRenderLink(elm, this.model.getPath());
        },
        renderTitle : function(elm) {
            elm.text(this.model.getTitle());
        },

        toggleCheckbox : function(versionId, index) {
            if (versionId in this.selectedVersionIds) {
                delete this.selectedVersionIds[versionId];
            } else {
                this.selectedVersionIds[versionId] = index;
            }
            var activeBtn = _.keys(this.selectedVersionIds).length == 2;
            if (activeBtn) {
                this.btnCompare.removeAttr('disabled');
            } else {
                this.btnCompare.attr('disabled', 'disabled');
            }
        },
        renderCheckbox : function(elm) {
            var view = this;
            var item = view.currentItem;
            var index = view.currentItemIndex;
            elm.val(item.versionId);
            elm.click(function() {
                view.toggleCheckbox(item.versionId, index);
            })
            this.versionPositions[item.versionId] = index;
        },
        renderAuthor : function(elm) {
            elm.text(this.currentItem.author);
        },
        renderRevisionDate : function(elm) {
            var timestamp = this.currentItem.timestamp;
            var str = this.getFormattedRevisionDate(timestamp);
            elm.text(str);
        },
        renderHistoryRef : function(elm) {
            var path = this.model.getPath();
            var versionId = this.currentItem.versionId;
            if (this.currentItemIndex > 0) {
                path = this.toHistoryLink(path, versionId);
            } else {
                path = this.getLink(path);
            }
            this._setLinkAttributes(elm, path);
            var label = this.getShortVersionId(versionId)
            elm.text(label);
        },

        renderHistory : function(elm) {
            var parent = elm.parent();
            elm.remove();
            var view = this;
            var history = view.getHistory();
            history = _.sortBy(history, function(elt) {
                return -elt.timestamp;
            });
            _.each(history, function(item, index) {
                if (index == history.length - 1)
                    return;
                view.currentItem = item;
                view.currentItemIndex = index;
                var e = elm.clone();
                parent.append(e);
                view.renderElement(e, false);
            });
            return false;
        },

        renderCompareButton : function(btn) {
            this.btnCompare = btn;
            this.btnCompare.attr('disabled', 'disabled');
            var that = this;
            this.btnCompare.click(function() {
                var versionIds = _.keys(that.selectedVersionIds);
                versionIds = _.sortBy(versionIds, function(versionId) {
                    return that.selectedVersionIds[versionId];
                })
                if (versionIds.length == 2) {
                    var fullPath = that.getLink(that.model.getPath()
                            + '/history/compare/' + versionIds[0] + '/with/'
                            + versionIds[1]);
                    that.navigateTo(fullPath);
                }
            })
        },

        getFormattedRevisionDate : function(timestamp) {
            return Utils.formatDate(timestamp);
        },

        getShortVersionId : function(versionId) {
            if (versionId && versionId.length > 7)
                return versionId.substring(0, 7);
            return versionId;
        },

        renderHistoryLink : function(versionId) {
            return this.asyncElement(function(a) {
                var path = this.model.getPath();
                path = this.toHistoryLink(path, versionId);
                this._setLinkAttributes(a, path);
            })
        }
    });
    return HistoryView;

});
