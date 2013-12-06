define([ 'Backbone', '../../commons/TemplateView', 'utils',
        '../../models/Validator', '../resource/ResourceContentView',
        'text!./ResourceListItemView.html' ],
 
function(Backbone, TemplateView, Utils, Validator, ResourceContentView, ResourceListItemTemplate) {

    var ResourceListItemView = TemplateView.extend({

        template : _.template(ResourceListItemTemplate),

        isValidationChecked : function() {
            return this.validationCheckbox.is(':checked');
        },
        renderItem : function(elm) {
            this.itemElement = elm;
            var id = this.model.getPath();
            elm.attr('data-id', id);
        },
        renderItemTop : function(elm) {
            var validator = Validator.getInstance();
            var model = this.model;
            var className = validator.wasCreated(model) ? 'created' : validator
                    .wasUpdated(model) ? 'updated' : 'validated';
            elm.addClass(className);
            var that = this;
            elm.click(function() {
                that.toggleItem();
            });
        },
        toggleItem : function() {
            if (this.isOpened) {
                this.close();
            } else {
                this.open();
            }
        },
        open : function() {
            this.itemElement.addClass('expanded');
            this.contentBlock.removeClass('hidden');
            this.isOpened = true;
            if (!this.isLoaded) {
                var that = this;
                // FIXME: replace it by an API call
                that.model.fetch({
                    // TODO: handle errors when no resource found
                    success : function(model) {
                        var contentView = new ResourceContentView({
                            model : model,
                            readOnly : true
                        });
                        that.isLoaded = true;
                        that.itemWidgetContainer.html('');
                        that.itemWidgetContainer.append(contentView.$el);
                        contentView.render();
                    }
                });
            }
            Backbone.pubSub.trigger('item:open', this);
        },
        close : function() {
            this.itemElement.removeClass('expanded');
            this.contentBlock.addClass('hidden');
            this.isOpened = false;
            Backbone.pubSub.trigger('item:close', this);
        },
        renderStatusIcon : function(elm) {
            var validator = Validator.getInstance();
            var model = this.model;
            var className = validator.wasCreated(model) ? 'glyphicon-flash'
                    : validator.wasUpdated(model) ? 'glyphicon-fire'
                            : 'glyphicon-flash';
            elm.addClass(className);
        },
        renderTitle : function(elm) {
            elm.text(this.model.getTitle());
        },
        renderDescription : function(elm) {
            var description = this.model.getDescription();
            // TODO: add Markdown formatting here
            elm.text(description);
        },
        renderCategoryLabel : function(elm) {
            var label = this.model.getCategoryLabel();
            elm.text(label);
        },
        renderUpdateTime : function(elm) {
            var str = Utils.formatDate(this.model.getUpdated().timestamp);
            elm.text(str);
        },
        renderContentBlock : function(elm) {
            this.contentBlock = elm;
            this.contentBlock.addClass('hidden');
        },
        renderValidationCheckbox : function(elm) {
            this.validationCheckbox = elm;
            var validator = Validator.getInstance();
            var validated = validator.isValidated(this.model);
            if (validated) {
                elm.hide();
            } else {
                elm.show();
            }
            elm.click(function(e) {
                e.stopPropagation();
            })
        },
        renderExternalEditRef : function(elm) {
            var href = elm.attr('href')
            href += '' + this.model.getPath();
            elm.attr('href', href);
        },
        renderItemRef : function(elm) {
            var path = this.model.getPath();
            this.doRenderLink(elm, path);
        },
        renderItemWidget : function(elm) {
            this.itemWidgetContainer = elm;
        }
    });

    return ResourceListItemView;
});