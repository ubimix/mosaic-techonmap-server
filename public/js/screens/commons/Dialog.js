define([ 'Underscore', './UmxView', 'text!./Dialog.html', 'BootstrapModal' ],

function(_, UmxView, Template) {

    var DialogView = UmxView.extend({

        className : 'modal fade',

        template : _.template(Template),

        renderTitle : function(el) {
            el.html(this.options.title);
        },

        renderContent : function(el) {
            this.contentElm = el;
            this.updateContent(this.options.content);
        },

        updateContent : function(content) {
            if (_.isObject(content) && content.render) {
                content = content.render().$el;
            }
            this.contentElm.html(content)
        },

        renderActionButtons : function(container) {
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
