define([ 'Underscore', '../../commons/UmxView', 'Backbone', 'utils',
        '../../models/Resource', './ResourceListItemView',
        '../../commons/Dialog', '../../models/Validator',
        'text!./ResourceListView.html' ],

function(_, UmxView, Backbone, Utils, Resource, ResourceListItemView, Dialog,
        Validator, ResourceListTemplate) {

    var ResourceListView = UmxView.extend({
        template : _.template(ResourceListTemplate),

        initialize : function() {
            _.bindAll(this, '_updateListStatus');
            this.subviews = [];
            this.collection.on('reset', function() {
                this.$el.empty();
                this.render();
            }, this);
            this._initializeScrollEvents();
        },

        _initializeScrollEvents : function() {
            // FIXME: remove it
            var opened = null;
            Backbone.pubSub.on('item:open', function(item) {
                if (opened && opened != item) {
                    opened.close();
                }
                opened = item;
                $('html, body').animate({
                    scrollTop : opened.$el.offset().top
                }, 10);
            });
            Backbone.pubSub.on('item:close', function(item) {
            });
        },

        events : {
            'click .action-validate' : 'handleValidateClick',
            'click a.sort' : 'handleSortClick',
            'click .howmany a' : 'handlePageCountClick'
        },

        getTotalRecordsNumber : function() {
            return this.collection.info().totalRecords;
        },

        // TODO: use backgrid.js ?
        renderResources : function(elm) {
            this.collection.forEach(function(resource) {
                var view = new ResourceListItemView({
                    model : resource,
                    workspace : this.options.workspace
                });
                elm.append(view.render().el);
                this.subviews.push(view);
            }, this);
        },

        renderRecordNumber : function(elm) {
            var len = this.getTotalRecordsNumber();
            elm.text('' + len);
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
            var list = [];
            var validator = Validator.getInstance();
            var collection = this.collection;
            _.each(this.subviews, function(view) {
                var validationChecked = view.isValidationChecked();
                if (validationChecked && !validator.isValidated(view.model)) {
                    list.push(view.model);
                }
            })
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

    return ResourceListView;
});