define([ '../../commons/UmxView', 'utils', '../resource/table-view',
        'text!./view.html' ],

function(UmxView, Utils, ResourceContentView, RevisionContainerTemplate) {

    var View = UmxView.extend({

        template : _.template(RevisionContainerTemplate),

        initialize : function() {
            console.log(this.model)
            _.bindAll(this, 'restoreVersion');
        },

        renderResourceLink : function(elm) {
            var link = this.model.getPath();
            this.doRenderLink(elm, link);
        },
        renderResourceHistoryLink : function(elm) {
            var link = this.model.getPath() + '/history';
            this.doRenderLink(elm, link);
        },
        renderTitle : function(elm) {
            var title = this.model.getTitle();
            elm.text(title);
        },
        renderVersionId : function(elm) {
            var versionId = this.getVersionId();
            elm.text(versionId);
        },
        renderContentView : function(elm) {
            var contentView = new ResourceContentView({
                model : this.model,
                readOnly : true
            });
            elm.append(contentView.$el);
            contentView.render();
        },
        renderRestoreBtn : function(elm) {
            elm.click(this.restoreVersion);
        },

        getPath : function() {
            return this.model.getPath();
        },

        getTitle : function() {
            return this.model.getTitle();
        },

        getVersionId : function() {
            return this.model.getVersionId();
        },

        restoreVersion : function() {
            var self = this;
            this.model.save(null, {
                success : function(updatedModel) {
                    self.remove();
                    var path = self.getLink(self.getPath() + '/history');
                    self.navigateTo(path);
                }
            });
        }

    });
    return View;

});
