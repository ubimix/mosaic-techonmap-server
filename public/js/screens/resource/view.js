define([ 'Backbone', 'BootstrapModal', 'BootstrapGrowl', 'core/viewManager', 'utils', 'text!./view.html' ], function(Backbone,
        BootstrapModal, BootstrapGrowl, viewManager, Utils, template) {

    var ResourceRowView = Backbone.View.extend({
        template : _.template(template),

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
            var view = this;
            this.$el.html(this.template({
                data : this.model.toJSON(),
                yaml : Utils.toYaml(this.model.attributes),
                workspace : this.options.workspace,
                path : this.options.path
            }));

            return this;
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

            var content = this.$el.find('textarea[name="content"]').val();
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
            this.model.attributes.properties = Utils.toJSON(content);

            // this.model = _.extend(this.model, {
            // attributes : JSON.parse(content)
            // });

            // console.log('Model updated: ', this.model);

            var self = this;
            if (this.model.attributes.sys.path) {
                this.model.save(null, {
                    success : function(model, response) {
                        // console.log('saved: '
                        // +
                        // JSON.stringify(data,
                        // null, 2));
                        // var obj =
                        // JSON.parse(data);
                        // var obj = data;
                        // self.model.set('system.version',
                        // response.system.version);
                        // self.model.set('system.date',
                        // response.system.date);

                        self.render();
                        // TODO: add bootstrap
                        // short message:
                        // resource saved
                        // self.$el.find('#dialog-save-ok').modal();
                        // $('#dialog-save-ok').modal();

                        // show_stack_bar_bottom('info');
                        // var notices =
                        // $(window).data("pnotify");
                        // console.log(notices.length);
                        // notices.length = 0;

                        // $.toast.config.align = 'center';
                        // // $.toast.config.width = 200;
                        // var message = 'Successfully saved';
                        // var options = {
                        // duration : 1000,
                        // sticky : false,
                        // type : 'success'
                        // };
                        // $.toast(message, options);

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