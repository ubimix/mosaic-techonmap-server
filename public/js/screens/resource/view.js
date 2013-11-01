//table-view / contentView

define([ '../commons/UmxView', '../commons/LinkController','BootstrapGrowl', 'Xeditable', '../models/Validator', 'core/viewManager', 'utils', './table-view', 'text!./view.html' ],

function(UmxView, LinkController, BootstrapGrowl, Xeditable, Validator, viewManager, Utils, ResourceContentView, ResourceContainerTemplate) {

    var ResourceContainerView = UmxView.extend({

        template : _.template(ResourceContainerTemplate),
        events : {
            'keydown' : 'onKeydown'
        },

        initialize : function() {
            _.bindAll(this, 'saveClicked',  
                        'deleteClicked', 'validateClicked', 'onKeydown');
            
            // var options = _.clone(this.options);
            // this is to force a fake change event
            this.model.set('type', 'Feature');
            this.contentView = new ResourceContentView({
                model : this.model
            });
            // TODO: use Marionette for unsubscribing from changes when
            // the view
            // disappears
            this.model.on('change', this.render, this);

        },
        
        getTitle: function() {
            return this.model.getTitle();
        },
        
        renderTitle: function() {
            return this.asyncElement(function(elm) {
                this.nameElm = elm;
                this.nameElm.text(this.getTitle());
                var placeholder = elm.data('title')
                this.nameElm.editable({
                    showbuttons:false,
                    highlight:false,
                    emptytext: placeholder||'',
                    unsavedclass:null
                });
            });
        },

        renderValidateBtn : function() {
            return this.asyncElement(function(elm) {
                elm.click(this.validateClicked);
            })
        },

        renderSaveBtn : function() {
            return this.asyncElement(function(elm) {
                elm.click(this.saveClicked);
            })
        },
        
        renderHistoryBtn : function() {
            return this.asyncElement(function(elm) {
                if (this.isNew()) {
                    elm.hide();
                } else {
                    this.doRenderHistoryLink(elm, this.model.getPath());
                }
            })
        },

        renderDeleteBtn : function() {
            return this.asyncElement(function(elm) {
                if (this.isNew()) {
                    elm.hide();
                } else {
                    elm.click(this.deleteClicked);
                }
            })
        },

        renderEditor : function() {
            return this.asyncElement(function(elm) {
                elm.append(this.contentView.$el);
                this.contentView.render();
            });
        },
        
        isNew : function() {
            var path = this.model.getPath();
            return !path || path == ''    
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
        },

        doSave : function(callback) {
            callback = callback||function(){}
            
            // TODO: handle error when yaml invalid: show
            // notification
            // TODO:
            // http://stackoverflow.com/questions/6351271/backbone-js-get-and-set-nested-object-attribute
            var self = this;
            
            var name = this.nameElm.text();
            var updatedModel = this.contentView.updateModel();
            Utils.updateObject(updatedModel.attributes, 'properties.name', name);
            console.log('model', this.model);
            console.log('updatedModel', updatedModel);
            
            // TODO: check how to check empty string in all browsers
            if (this.model.getPath() && this.model.getPath().length > 0) {
                this.updateModel(updatedModel, callback);
            } else {
                var id = updatedModel.getId();
                if (!id || id.length == 0) {
                    return Utils.showOkDialog('Erreur', 'Le champ <em>Identifiant</em> est requis.');
                } else {
                    this.model.set('id',id);
                    this.updateModel(updatedModel, function() {
                        var path = self.getLink(id);
                        self.navigateTo(path);
                        callback();
                    });
                }
            }            
        },
        
        // do not call this method 'resource' or it will interfere with
        // the 'remove' method of Backbone.View
        removeResource : function() {
            var self = this;
            var dialog = Utils.showOkDialog('Suppression', 'Suppression en cours...', function() {
                var path = self.getLink('');
                self.navigateTo(path);
            });

            var self = this;
            this.model.destroy({
                success : function() {
                    setTimeout(function() {
                        dialog.updateContent('Suppression effectuée.');
                    }, 500);
                    // TODO: see how to propagate the removal to
                    // the collection and to the collection view directly
                    return false;

                    // TODO: add bootstrap short message:
                    // resource saved
                    // TODO: add error callback
                }
            });
        },

        updateModel : function(updatedModel, callback) {
            this.model.updateAndSave(updatedModel, function(updatedResource) {
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
        
        saveClicked : function() {
            this.doSave();
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
            var self = this;
            this.doSave(function() {
                var validator = Validator.getInstance();
                validator.onReady(function() {
                    validator.validateResources([ self.model ]);
                    validator.once('loaded', function() {
                        var path = self.getLink('');
                        self.navigateTo(path);
                    });

                });
            });
        }
    });

    return ResourceContainerView;
});