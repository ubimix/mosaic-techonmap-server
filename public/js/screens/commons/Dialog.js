define([ 'Backbone', 'Underscore', 'text!./dialog.html', 'BootstrapModal' ],

function(Backbone, _, Template) {

    var DialogView = Backbone.View.extend({

        className : 'modal fade',

        template : _.template(Template),

        render : function() {
            var html = this.template({
                view : this
            })
            this.$el.html(html);
            this.renderActionButtons();
            return this;
        },

        renderTitle : function() {
            return this.options.title;
        },

        renderContent : function() {
            var content = this.options.content;
            return this.prepareContent(content);
        },

        prepareContent : function(content) {
            if (_.isObject(content) && content.render) {
                var el = content.render().$el;
                return el.html();
            }
            return content;
        },

        updateContent : function(content) {
            content = this.prepareContent(content);
            this.$el.find('.modal-body').html(content);
        },

        renderActionButtons : function() {
            var container = this.$('.modal-footer');
            var list = this.options.actions;
            _.each(list, function(item, index) {
                var btn = $('<button class="btn"></button>');
                if (item.primary) {
                    btn.addClass('btn-primary');
                }
                btn.html(item.label);
                var action = item.action;
                if (action) {
                    btn.click(function() {
                        action();
                    })
                }
                container.append(btn);
            });
        },

        show : function() {
            this.render();
            this.$el.modal('show');

        },

        hide : function() {
            this.$el.modal('hide');
            this.$el.remove();
        }

    });

    return DialogView;

});
