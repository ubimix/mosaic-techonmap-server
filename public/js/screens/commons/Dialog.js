define([ 'Underscore', './UmxView', 'text!./Dialog.html', 'BootstrapModal' ],

function(_, UmxView, Template) {

    var DialogView = UmxView.extend({

        className : 'modal fade',

        template : _.template(Template),

        renderTitle : function() {
            return this.asyncElement(function(el) {
                el.html(this.options.title);
            })
        },

        renderContent : function() {
            return this.asyncElement(function(el) {
                this.contentElm = el;
                this.updateContent(this.options.content);
            })
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
            this.contentElm.html(content)
        },

        renderActionButtons : function() {
            return this.asyncElement(function(container) {
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
            })
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
