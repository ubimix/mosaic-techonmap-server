define([ 'Underscore', '../../commons/UmxView', 'Backbone', 'utils',
        '../../models/Resource', './resourcelistitem',
        '../../resource/table-view', '../../commons/Dialog',
        '../../models/Validator', 'text!./resourcelist.html' ],

function(_, UmxView, Backbone, Utils, Resource, ResourceRowView,
        ResourceContentView, Dialog, Validator, ResourceListTemplate) {

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

    var View = UmxView.extend({
        template : _.template(ResourceListTemplate),
        // resourceTemplate : _.template(resourceTemplate),

        initialize : function() {
            _.bindAll(this, '_updateListStatus');
            this.subviews = [];
            this.collection.on('reset', function() {
                this.$el.empty();
                this.render();
            }, this);

        },

        events : {
            'click .action-validate' : 'handleValidateClick',
            'click a.sort' : 'handleSortClick',
            'click .howmany a' : 'handlePageCountClick',
            'click .media .media-top' : 'handleEntryClick',
        },

        getTotalRecordsNumber : function() {
            return this.collection.info().totalRecords;
        },

        // TODO: use backgrid.js ?
        renderResources : function() {
            return this.asyncElement(function(elm) {
                this.collection.forEach(function(resource) {
                    var view = new ResourceRowView({
                        model : resource,
                        workspace : this.options.workspace
                    });
                    elm.append(view.render().el);
                    this.subviews.push(view);
                }, this);

            })
        },

        handleEntryClick : function(event) {
            var target = $(event.currentTarget);
            var sender = $(event.target);
            // if the target is a link we don't expand
            if (sender.prop('tagName') == 'I')
                return;

            var e = target.parent().parent();
            this.$el.find('.media-content').each(
                    function(i) {
                        if ($(this).parent().parent().attr('data-id') != e
                                .attr('data-id')) {
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
            // if (!content.attr('data-loaded')) {
            var id = e.attr('data-id');
            content.attr('data-loaded', true);
            var media = content.parent().parent();
            content.html('Chargement...');
            media.toggleClass('expanded');
            content.toggle();
            var that = this;
            loadEntry(id, function(data) {
                // var xYaml = Utils.toStructuredContent(data);
                // TODO: escape html
                // content.html(that.resourceTemplate(xYaml));
                var contentView = new ResourceContentView({
                    model : data,
                    readOnly : true
                });

                // content.html(contentView.render().$el.html());
                content.html('');
                content.append(contentView.$el);
                contentView.render();

                // $('#cmcontent').html(contentView.render().$el.html());

            })
            // } else {
            // content.toggle();
            // var media = content.parent().parent();
            // media.toggleClass('expanded');
            // }

        },

        handleSortClick : function(e) {
            e.preventDefault();
            e.stopPropagation();
            var sort = $(e.currentTarget).data('sort');
            var sortOrder = $(e.currentTarget).data('sort-order') || 'asc';
            Backbone.pubSub.trigger('sort', {
                sort : sort,
                sortOrder : sortOrder
            });
        },

        handlePageCountClick : function(e) {
            e.preventDefault();
            e.stopPropagation();
            var per = $(e.target).text();
            Backbone.pubSub.trigger('pagecount', per);
        },

        _updateListStatus : function() {
            var validator = Validator.getInstance();
            var selection = this.$('.media');
            var collection = this.collection;
            selection.each(function() {
                var item = $(this);
                var id = item.data('id');
                var resource = collection.getById(id);
                if (validator.isValidated(resource)) {
                    item.find('.validation').remove();
                }
                var el = item.find('.media-top');
                el.removeClass('validated');
                if (resource && validator.isValidated(resource)) {
                    el.removeClass('created');
                    el.removeClass('updated');
                    el.addClass('validated');
                }
            });
        },

        handleValidateClick : function(event) {
            // TODO: we should probably refresh the validator when hitting the
            // validate button because the validated items may have changed in
            // other tabs meantime
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
                var title = this.$('.dialog-validation .title').html();
                var content = this.$('.dialog-validation .message').html();
                var dialog = Utils.showYesNoDialog(title, content, function() {
                    validator.once('loaded', that._updateListStatus);
                    validator.validateAll();
                    dialog.hide();
                }, function() {
                    dialog.hide();
                });
            } else {
                validator.once('loaded', that._updateListStatus);
                validator.validateResources(list);
            }

        }

    });

    return View;
});