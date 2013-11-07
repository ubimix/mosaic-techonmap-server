define([ 'Underscore', '../commons/UmxView', '../commons/LinkController',
        'text!./view.html' ],

function(_, UmxView, LinkController, template) {

    var View = UmxView.extend({
        template : _.template(template),

        events : {
            'click .go' : 'openResource'
        },

        renderSearchBox : function() {
            return this.asyncElement(function(elm) {
                var data;
                this.searchBox = elm;
                this.searchBox.typeahead({
                    source : function(query, process) {
                        var linkController = LinkController.getInstance();
                        var url = linkController.getLink('/api/typeahead');
                        return $.get(url, {
                            query : query
                        }, function(items) {
                            data = items;
                            return process(_.pluck(items, 'name'));
                        });
                    },
                    updater : function(item) {
                        var found = _.find(data, function(it) {
                            return it.name == item
                        });
                        // console.log('ID: ', nameIdMap[item]);
                        // console.log('Found: ', found.id);
                        $('#resource-id').val(found.id);
                        return item;
                    }
                });

            });
        },

        openResource : function() {
            // TODO: a link would be better than a button so that the
            // history
            // can be opened in a new tab
            // TODO: use events to switch from one view to the other, so
            // that
            // not all views need to be loaded upfront
            var path = this.searchBox.val();
            path = this.getLink(path);
            this.navigateTo(path);
            return false;
        },

    });
    return View;

});
