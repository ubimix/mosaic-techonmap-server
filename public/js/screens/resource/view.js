define([ 'Backbone', 'text!./view.html', 'core/viewManager', 'BootstrapModal', 'yaml' ], function(Backbone, template,
        viewManager, BootstrapModal, YAML) {

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
            var view = this;
            this.$el.html(this.template({
                data : this.model.toJSON(),
                yaml : this.toYaml(),
                workspace : this.options.workspace,
                path : this.options.path
            }));

            this.$el.keydown(function(event) {
//                console.log(event.which);
                if (event.altKey) {
                    if (event.which == 83) {
                        // alt+S
                        view.submitResource();
                    } else if (event.which == 76) {
                        // alt+L
                        $('.type-ahead').focus();
                    }
                }

            });

            return this;
        },

        toYaml : function() {
            var copy = _.extend({}, this.model.attributes);
            var description = copy.properties.description;
            delete copy.properties.description;
            var dataYaml = YAML.stringify(copy.properties, 1, 2);
            var text = description + "\n\n----\n" + dataYaml;
            return text;

        },

        historyScreen : function() {
            // TODO: a link would be better than a button so that the
            // history
            // can be opened in a new tab
            // TODO: use events to switch from one view to the other, so
            // that
            // not all views need to be loaded upfront
            this.remove();
            Backbone.history.navigate('/' + this.options.workspace + '/' + this.options.path + '/history', true);
            return false;
        },

        submitResource : function() {
            var content = this.$el.find('textarea[name="content"]').val();
            var idx = content.indexOf('----\n');
            var yaml = '';
            var description = '';
            if (idx >= 0) {
                yaml = content.substring(idx + '----\n'.length);
                description = content.substring(0, idx).trim();
            }
            try {
                var obj = YAML.parse(yaml);
            } catch (e) {
                $('#dialog-save-not-ok').modal()
                return;
            }

            obj.description = description;

            // TODO: is this ok?
            // NB: the model won't fire a change event in this case (a
            // change is
            // probably fired only when doing 'model.set(...)')
            // this.model = _.extend(this.model, {
            // attributes : {
            // properties : obj
            // }
            // });

            // quid if the client changes the sys.path attribute on the client
            // side ?
            this.model.attributes.properties = obj;

            // this.model = _.extend(this.model, {
            // attributes : JSON.parse(content)
            // });

            // console.log('Model updated: ', this.model);

            var self = this;
            this.model.save(null, {
                success : function(model, response) {
                    // console.log('saved: ' + JSON.stringify(data,
                    // null, 2));
                    // var obj = JSON.parse(data);
                    // var obj = data;
                    // self.model.set('system.version',
                    // response.system.version);
                    // self.model.set('system.date',
                    // response.system.date);

                    self.render();
                    // TODO: add bootstrap short message: resource saved
                    $('#dialog-save-ok').modal()

                    // TODO: add error callback
                }
            });
        },

        // do not call this method 'resource' or it will interfere with
        // the
        // 'remove' method of Backbone.View
        removeResource : function() {
            var self = this;
            this.model.destroy({
                success : function() {
                    // TODO: see how to propagate the removal to the
                    // collection
                    // and to the collection view directly
                    self.remove();
                    Backbone.history.navigate('/' + self.options.workspace, true);
                    return false;

                    // TODO: add bootstrap short message: resource saved
                    // TODO: add error callback
                }
            });
        }

    });

    return ResourceRowView;
});