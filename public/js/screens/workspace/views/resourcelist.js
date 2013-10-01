define([ 'Backbone', 'Underscore', 'utils', '../../models/Resource', './resourcelistitem', '../../resource/contentView',
        '../../commons/Dialog', '../../models/Validator', 'text!./resourcelist.html' ],

function(Backbone, _, Utils, Resource, ResourceRowView, ResourceContentView, Dialog, Validator, ResourceListTemplate) {

    function loadEntry(id, callback) {
        var resource = new Resource({
            id : id
        });

        resource.fetch({
            // TODO: handle errors when no resource found with given id
            success : function(model, object) {
                callback(model);
            }
        });

    }

    var View = Backbone.View.extend({
        template : _.template(ResourceListTemplate),
        // resourceTemplate : _.template(resourceTemplate),

        initialize : function() {
            _.bindAll(this, '_updateListStatus');
            this.subviews = [];

            this.collection.on('reset', function() {
                // TODO: why does 'this' refer to the view while we're in a
                // function
                this.$el.empty();
                this.render();
            }, this);

        },

        events : {
            'click .media .media-top' : 'handleEntryClick',
            'click .action-validate' : 'handleValidateClick',
            'click .validation' : 'handleSelectionClick'
        },

        // TODO: use backgrid.js ?

        render : function() {
            // TODO add loading indicator
            // TODO: do we need to remove the view when rendering it
            // again ?
            this.$el.html(this.template(this.options));

            // TODO:
            // http://stackoverflow.com/questions/8051975/access-object-child-properties-using-a-dot-notation-string
            function getDotProperty(obj, dotNotation) {
                var arr = dotNotation.split(".");
                while (arr.length && (obj = obj[arr.shift()]))
                    ;
                return obj;
            }

            var resourceElt = this.$('.resources');

            this.collection.forEach(function(resource) {
                var view = new ResourceRowView({
                    model : resource,
                    workspace : this.options.workspace
                });
                resourceElt.append(view.render().el);
                this.subviews.push(view);
            }, this);

            return this;
        },

        handleEntryClick : function(event) {
            var target = $(event.currentTarget);
            var sender = $(event.target);
            // if the target is a link we don't expand
            if (sender.prop('tagName') == 'I')
                return;

            var e = target.parent().parent();

            this.$el.find('.media-content').each(function(i) {
                if ($(this).parent().parent().attr('data-id') != e.attr('data-id')) {
                    $(this).html('');
                    $(this).hide();
                }
            });

            this.$el.find('.media').each(function(i) {
                if ($(this).attr('data-id') != e.attr('data-id')) {
                    $(this).removeClass('expanded');
                }
            });

            var content = e.find('.media-content');
            console.log(content);
            // if (!content.attr('data-loaded')) {
            var id = e.attr('data-id');
            content.attr('data-loaded', true);
            var media = content.parent().parent();
            content.html('Loading...');
            media.toggleClass('expanded');
            content.toggle();
            var that = this;
            loadEntry(id, function(data) {
                // var xYaml = Utils.toStructuredContent(data);
                // TODO: escape html
                // content.html(that.resourceTemplate(xYaml));
                var contentView = new ResourceContentView({
                    model : data
                });

                content.html(contentView.render().$el.html());
                // $('#cmcontent').html(contentView.render().$el.html());

            })
            // } else {
            // content.toggle();
            // var media = content.parent().parent();
            // media.toggleClass('expanded');
            // }

        },

        _updateListStatus : function() {
            var validator = Validator.getInstance();
            var selection = this.$('.media');
            var collection = this.collection;
            selection.each(function() {
                var item = $(this);
                var id = item.data('id');
                var resource = collection.getById(id);
                console.log(id, resource);
                item.find('.validation').remove();
                var el = item.find('.media-top');
                el.removeClass('validated');
                el.removeClass('not-validated');
                if (resource && !validator.isValidated(resource)) {
                } else {
                    el.addClass('validated');
                }
            });
        },

        handleValidateClick : function(event) {
            var selection = this.$('.validation:checked');
            var list = [];
            var validator = Validator.getInstance();
            var collection = this.collection;
            selection.each(function() {
                var id = $(this).data('id');
                var resource = collection.getById(id);
                if (resource && !validator.isValidated(resource))
                    list.push(resource);
            });

            var that = this;
            if (!list || list.length == 0) {
                var dialog = new Dialog({
                    title : this.$el.find('.dialog-validation .title').html(),
                    content : this.$el.find('.dialog-validation .message').html(),
                    actions : [ {
                        label : 'Yes',
                        primary : true,
                        action : function() {
                            validator.once('loaded', that._updateListStatus);
                            validator.validateAll();
                            dialog.hide();
                        }
                    }, {
                        label : 'No',
                        action : function() {
                            dialog.hide();
                        }
                    } ]
                });
                dialog.show();
            } else {
                validator.once('loaded', that._updateListStatus);
                validator.validateResources(list);
            }

        },

        handleSelectionClick : function(event) {
            event.stopPropagation();
        }

    });

    return View;
});