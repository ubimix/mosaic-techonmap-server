define([ 'Backbone', 'BootstrapModal', 'BootstrapGrowl', 'CodeMirror', 'core/viewManager', 'utils', './contentView',
        'text!./view.html' ],

function(Backbone, BootstrapModal, BootstrapGrowl, CodeMirror, viewManager, Utils, ResourceContentView, ResourceRowViewTemplate) {

    var ResourceRowView = Backbone.View.extend({

        template : _.template(ResourceRowViewTemplate),
        events : {
            'click .submit' : 'submitResource',
            'click .history' : 'historyScreen',
            'click .delete' : 'removeResource',
            'keydown' : 'onKeydown'
        },

        initialize : function() {
            // this.model.on('change', this.render, this);
        },

        render : function() {
            var options = _.clone(this.options);
            var contentView = new ResourceContentView(options);
            var html = this.template({
                content : contentView.render().$el,
                data : this.model.toJSON(),
                view : this
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

            var description = contentEditor.getValue();
            var properties = propertiesEditor.getValue();
            // TODO: handle error when yaml invalid: show
            // notification
            // TODO: is this ok?
            // NB: the model won't fire a change event in this
            // case (a
            // change is
            // probably fired only when doing 'model.set(...)')
            // quid if the client changes the sys.path attribute
            // on the client
            // side ?

            // iterate over the properties and set them to the model

            // TODO:
            // http://stackoverflow.com/questions/6351271/backbone-js-get-and-set-nested-object-attribute
            // var props = Utils.toJSON(description, properties);
            // var model = this.model;
            // _.each(props, function(value, key) {
            // console.log(key, value);
            // model.set('properties.'+key, value);
            // });

            this.model.attributes.properties = Utils.toJSON(description, properties);

            // this.model = _.extend(this.model, {
            // attributes : JSON.parse(content)
            // });

            // console.log('Model updated: ', this.model);

            var self = this;
            if (this.model.attributes.sys.path) {
                this.model.save(null, {
                    success : function(model, response) {

                        self.render();
                        $.bootstrapGrowl("Successfully saved", {
                            ele : 'body', // which element to append to
                            type : 'success', // (null, 'info', 'error',
                            // 'success')
                            offset : {
                                from : 'top',
                                amount : 40
                            }, // 'top', or 'bottom'
                            align : 'center', // ('left', 'right', or
                            // 'center')
                            width : 'auto', // (integer, or 'auto')
                            delay : 1500,
                            allow_dismiss : false,
                            stackup_spacing : 10
                        // spacing between consecutively stacked growls.
                        });

                        // TODO: add error
                        // callback
                    }
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

    return ResourceRowView;
});