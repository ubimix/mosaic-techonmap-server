require([ 'require.config' ], function() {
    require([ 'jQuery', 'Underscore', 'Backbone', './TopView' ],
    //
    function($, _, Backbone, TopView) {

        var ContentView = TopView.extend({
            template : _.template('' + '<div style="color: gray;">'
                    + '<p data-render="renderParagraphs">Content</p>'
                    + '</div>'),
            renderParagraphs : function(el) {
                var parent = el.parent();
                el.remove();
                _.each(this.model.get('content'), function(p) {
                    var e = el.clone();
                    e.html(p);
                    e.click(function() {
                        alert(e.html());
                    })
                    parent.append(e);
                }, this);
            }

        });

        var View = TopView.extend({
            template : _.template('' + '<div data-render="renderTop">'
                    + '<h3 data-render="renderTitle">Title</h3>'
                    + '<div data-render="renderContent">Content</div>'
                    + '</div>'),
            renderTop : function(el) {
                console.log('Render Top');
            },
            renderTitle : function(el) {
                el.html(this.model.get('title'))
                var that = this;
                el.click(function() {
                    that.contentEl.toggle();
                })
            },
            renderContent : function(el) {
                this.contentEl = el;
                new ContentView({
                    el : el,
                    model : this.model
                }).render();
                return false;
            }
        })

        new View({
            model : new Backbone.Model({
                title : 'Hello, world!',
                content : [ 'This is a content', 'Second paragraph' ]
            }),
            el : $('#main')
        }).render()

    });
})
