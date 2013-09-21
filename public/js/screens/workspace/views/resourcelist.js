define([ 'Backbone', 'utils', './resourcelistitem', 'text!./resourcelist.html' ], function(Backbone, Utils, ResourceRowView, template) {

    function loadEntry(id, callback) {
        $.get('/api/resources' + id + '?' + Math.random(), function(data) {
            callback(data);
        });
    }

    var View = Backbone.View.extend({
        template : _.template(template),

        initialize : function() {
            //this.subviews = [];
            
            this.collection.on('reset', function() {
                //TODO: why does 'this' refer to the view while we're in a function
                this.$el.empty();
                this.render();
            }, this);
            
        },

        events : {
            'click .media .media-top' : 'handleEntryClick'
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
//            var sortField = 'sys.updated.timestamp';
//            if (this.options.sort)
//                sortField = this.options.sort;
//            var models = _.sortBy(this.collection.models, function(resource) {
//                // TODO: how to avoid accessing the attributes
//                return getDotProperty(resource.attributes, sortField);
//            });
//
//            if (sortField == 'sys.updated.timestamp')
//                models.reverse();
            
            this.collection.forEach(function(resource) {
                var view = new ResourceRowView({
                    model : resource,
                    workspace : this.options.workspace
                });
                resourceElt.append(view.render().el);
                //this.subviews.push(view);
            }, this);

            return this;
        },

        handleEntryClick : function(event) {
            var target = $(event.currentTarget);
            var sender = $(event.target);
            // if the target is a link we don't expand
            console.log(sender.prop('tagName'));
            if (sender.prop('tagName') == 'I')
                return;

            var e = target.parent().parent();

            this.$el.find('.media-content').each(function(i) {
                if ($(this).parent().parent().attr('data-id') != e.attr('data-id')) {
                    $(this).hide();
                }
            });

            this.$el.find('.media').each(function(i) {
                if ($(this).attr('data-id') != e.attr('data-id')) {
                    $(this).removeClass('expanded');
                }
            });

            var content = e.find('.media-content');
            if (!content.attr('data-loaded')) {
                var id = e.attr('data-id');
                content.attr('data-loaded', true);
                var media = content.parent().parent();
                content.html('Loading...');
                media.toggleClass('expanded');
                content.toggle();
                loadEntry(id, function(data) {
                    var xYaml = Utils.toYaml(data);
                    content.html('<pre>' + xYaml + '</pre>');
                })
            } else {
                content.toggle();
                var media = content.parent().parent();
                media.toggleClass('expanded');
            }

        }

    });

    return View;
});