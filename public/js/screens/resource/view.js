define([ 'Backbone', 'BootstrapModal', 'BootstrapGrowl', 'CodeMirror', 'core/viewManager', 'utils', './contentView',
        'text!./view.html', 'CodeMirrorYaml' ],

function(Backbone, BootstrapModal, BootstrapGrowl, CodeMirror, viewManager, Utils, ResourceContentView, ResourceContainerTemplate) {

    var ResourceContainerView = Backbone.View.extend({

        template : _.template(ResourceContainerTemplate),
        events : {
            'click .submit' : 'submitResource',
            'click .history' : 'historyScreen',
            'click .delete' : 'removeResource',
            'keydown' : 'onKeydown'
        },

        initialize : function() {
            // var options = _.clone(this.options);
            var copy = this.model.getCopy();
            this.contentView = new ResourceContentView({
                model : copy
            });
            // TODO: use Marionette for unsubscribing from changes when the view
            // disappears
            this.model.on('change', this.render, this);
        },

        render : function() {
            var html = this.template({
                content : this.contentView.render().$el,
                data : this.model.toJSON(),
                model : this.model
            })
            this.$el.html(html);

            return this;
        },

        getTitle : function() {
            return this.model.attributes.properties.name;
        },

        onKeydown : function(event) {
            if (event.altKey) {
                if (event.which == 83) {
                    // alt+S
                    this.submitResource();
                }
                // TODO: won't work, why ?
                // else if (event.which == 76) {
                // // alt+L
                // $('.type-ahead').focus();
                // }
            }
            return;

        },

        historyScreen : function() {
            // TODO: a link would be better than a button so
            // that the
            // history
            // can be opened in a new tab
            // TODO: use events to switch from one view to the
            // other, so
            // that
            // not all views need to be loaded upfront
            this.remove();
            Backbone.history.navigate('/' + this.options.workspace + '/' + this.options.path + '/history', true);
            return false;
        },

        submitResource : function() {

            // TODO: handle error when yaml invalid: show
            // notification
            // TODO:
            // http://stackoverflow.com/questions/6351271/backbone-js-get-and-set-nested-object-attribute

            var self = this;
            if (this.model.attributes.sys.path) {
                var updatedModel = this.contentView.updateModel();
                this.model.updateAndSave(updatedModel.get('properties'), function(updatedResource) {
                    $.bootstrapGrowl("Successfully saved", {
                        ele : 'body',
                        type : 'success',
                        offset : {
                            from : 'top',
                            amount : 40
                        },
                        align : 'center',
                        width : 'auto',
                        delay : 1500,
                        allow_dismiss : false,
                        stackup_spacing : 10
                    });
                });

            } else {
                var path = this.$el.find('#path').val();
                if (!path)
                    path = Math.random().toString(36).substring(7);

                $.ajax({
                    url : '/api/resources/new',
                    type : 'POST',
                    data : {
                        path : path,
                        resource : this.model.attributes
                    },
                    dataType : 'json',
                    success : function(result) {
                        if (result.error) {
                            // TODO: notification
                            console.log(result.error);
                        } else {
                            self.remove();
                            Backbone.history.navigate('/techonmap/' + path, true);
                        }

                    },
                    error : function(error) {
                        console.log(error);
                    }
                });
            }
        },

        // do not call this method 'resource' or it will
        // interfere with
        // the
        // 'remove' method of Backbone.View
        removeResource : function() {
            $('#dialog-delete-confirm').modal('hide');
            var self = this;
            this.model.destroy({
                success : function() {
                    // TODO: see how to propagate the removal to
                    // the
                    // collection
                    // and to the collection view directly
                    self.remove();
                    Backbone.history.navigate('/' + self.options.workspace, true);
                    return false;

                    // TODO: add bootstrap short message:
                    // resource saved
                    // TODO: add error callback
                }
            });
        }

    });

    return ResourceContainerView;
});