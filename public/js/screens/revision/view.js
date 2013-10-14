define([ '../commons/UmxView', 'utils', '../resource/table-view',
        'text!./view.html' ],

function(UmxView, Utils, ResourceContentView, RevisionContainerTemplate) {

    var View = UmxView.extend({

        template : _.template(RevisionContainerTemplate),

        initialize : function() {
            console.log(this.model)
            _.bindAll(this, 'restoreVersion');
        },

        renderContentView : function() {
            return this.asyncElement(function(elm) {
                var contentView = new ResourceContentView({
                    model : this.model,
                    readOnly : true
                });
                elm.append(contentView.$el);
                contentView.render();
            });
        },

        renderRestoreBtn : function() {
            return this.asyncElement(function(elm) {
                elm.click(this.restoreVersion);
            });
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
