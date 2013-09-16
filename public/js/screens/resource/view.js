define([ 'Backbone', 'text!./view.html', 'core/viewManager', '../history/app', '../workspace/app' ], function(Backbone, template,
        viewManager, historyScreen, workspaceScreen) {

    var ResourceRowView = Backbone.View.extend({
        template : _.template(template),

        events : {
            'click .submit' : 'submitResource',
            'click .history' : 'historyScreen',
            'click .delete' : 'removeResource'
        },

        initialize : function() {
            // this.model.on('change', this.render, this);
        },

        render : function() {
            this.$el.html(this.template({
                data : this.model.toJSON(),
                workspace : this.options.workspace,
                path : this.options.path
            }));
            return this;
        },

        historyScreen : function() {
            // TODO: a link would be better than a button so that the history
            // can be opened in a new tab
            // TODO: use events to switch from one view to the other, so that
            // not all views need to be loaded upfront
            this.remove();
            Backbone.history.navigate('/' + this.options.workspace + '/' + this.options.path + '/history', true);
            historyScreen.run(viewManager, {
                workspace : this.options.workspace,
                path : this.options.path
            });
            return false;
        },

        submitResource : function() {
            var content = this.$el.find('textarea[name="content"]').val();
            // TODO: is this ok?
            // NB: the model won't fire a change event in this case (a change is
            // probably fired only when doing 'model.set(...)')
            this.model = _.extend(this.model, {
                attributes : JSON.parse(content)
            });
            var self = this;
            this.model.save(null, {
                success : function() {
                    self.render();
                    // TODO: add bootstrap short message: resource saved
                    $('#dialog-save-ok').modal()
                    
                    // TODO: add error callback
                }
            });
        },

        // do not call this method 'resource' or it will interfere with the
        // 'remove' method of Backbone.View
        removeResource : function() {
            var self = this;
            this.model.destroy({
                success : function() {
                    // TODO: see how to propagate the removal to the collection
                    // and to the collection view directly
                    self.remove();
                    Backbone.history.navigate('/' + self.options.workspace, true);
                    workspaceScreen.run(viewManager, {
                        workspace : self.options.workspace
                    });
                    return false;

                    // TODO: add bootstrap short message: resource saved
                    // TODO: add error callback
                }
            });
        }

    });

    return ResourceRowView;
});