//table-view / contentView

define([ 'Backbone', 'BootstrapGrowl', '../models/Validator', 'core/viewManager', 'utils', './table-view',
        'text!./view.html' ],

        function(Backbone, BootstrapGrowl, Validator, viewManager, Utils, ResourceContentView,
                ResourceContainerTemplate) {

            var ResourceContainerView = Backbone.View.extend({

                template : _.template(ResourceContainerTemplate),
                events : {
                    'click .submit' : 'saveClicked',
                    'click .history' : 'historyClicked',
                    'click .delete' : 'deleteClicked',
                    'click .validate' : 'validateClicked',
                    'keydown' : 'onKeydown'
                },

                initialize : function() {
                    // var options = _.clone(this.options);
                    // this is to force a fake change event
                    
                    var copy = this.model.getCopy();
                    this.contentView = new ResourceContentView({
                        model : copy
                    });
                    // TODO: use Marionette for unsubscribing from changes when
                    // the view
                    // disappears
                    this.model.on('change', this.render, this);
                    
                    this.model.trigger('change');
                },

                render : function() {
                    var html = this.template({
                        // content : this.contentView.render().$el,
                        data : this.model.toJSON(),
                        model : this.model
                    })
                    this.$el.html(html);

                    this.$('#editors').append(this.contentView.$el);
                    this.contentView.render();

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

                historyClicked : function() {
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

                saveClicked : function(event, callback) {

                    // TODO: handle error when yaml invalid: show
                    // notification
                    // TODO:
                    // http://stackoverflow.com/questions/6351271/backbone-js-get-and-set-nested-object-attribute

                    var self = this;
                    // TODO: check how to check empty string in all browsers
                    if (this.model.getPath() && this.model.getPath().length > 0) {
                        try {
                            var updatedModel = this.contentView.updateModel();
                        } catch (e) {
                            return Utils
                                    .showOkDialog('Erreur', 'Une erreur s\'est produite, merci de vérifier le contenu saisi.');
                        }
                        this.updateModel(this.model, updatedModel, callback);

                    } else {
                        // if (!path)
                        // path = Math.random().toString(36).substring(7);
                        var updatedModel = this.contentView.updateModel();
                        var id = updatedModel.getId();
                        if (!id || id.length == 0) {
                            return Utils.showOkDialog('Erreur', 'Le champ <em>Identifiant</em> est requis.');
                        } else {
                            updatedModel.id = id;
                            this.updateModel(updatedModel, updatedModel);
                            self.remove();
                            Backbone.history.navigate(this.options.workspace + '/' + id, true);
                        }

                    }
                },

                // do not call this method 'resource' or it will
                // interfere with
                // the
                // 'remove' method of Backbone.View
                removeResource : function() {
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
                },

                updateModel : function(currentModel, updatedModel, callback) {
                    if (!this.model.hasChanged()) {
                        typeof callback === 'function' && callback();
                        return;
                    }
                    currentModel.updateAndSave(updatedModel.get('properties'), updatedModel.get('geometry'), function(
                            updatedResource) {
                        $.bootstrapGrowl("Enregistrement effectué", {
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
                        typeof callback === 'function' && callback();
                    });
                },

                deleteClicked : function() {
                    var _this = this;
                    var dialog = Utils.showYesNoDialog('Confirmation', 'Confirmer la suppression de l\'entité ?', function() {
                        dialog.hide();
                        _this.removeResource();
                    }, function() {
                        dialog.hide();
                    });

                },

                validateClicked : function(event) {
                    // submit then validate, then go back to list
                    // TODO: check wether resource has actually changed
                    var that = this;
                    this.saveClicked(event, function() {
                        var validator = Validator.getInstance();
                        validator.onReady(function() {
                            validator.validateResources([ that.model ]);
                            validator.once('loaded', function() {
                                Backbone.history.navigate('/', true);
                            });

                        });
                    });

                }

            });

            return ResourceContainerView;
        });