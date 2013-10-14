define([ 'Underscore', '../collections/ResourceCollection',
        '../commons/Dialog', 'text!./export.html', 'BootstrapModal' ],

function(_, ResourceCollection, Dialog, Template) {

    var DialogView = Dialog.extend({

        template : _.template(Template),

        events : {
            'click .export-json' : 'jsonExportClicked',
            'click .export-csv' : 'csvExportClicked'
        },

        jsonExportClicked : function(event) {
            var target = $(event.currentTarget);
            target.toggleClass('active');
            this._exportResources(target, function(collection) {
                return JSON.stringify(collection.models, null, 2);
            });
        },

        csvExportClicked : function(event) {
            var target = $(event.currentTarget);
            target.toggleClass('active');
            this._exportResources(target, function(collection) {
                return JSON.stringify(collection.models, null, 2);
            });
        },

        _exportResources : function(target, convert) {
            var that = this;
            var textarea = this.$('.export-content');
            textarea.val('');
            var coll = new ResourceCollection();
            coll.fetch({
                success : function(coll) {
                    _.each(coll.models, function(item, index) {
                        item.deleteSysAttributes();
                    });
                    var formattedContent = convert(coll);
                    textarea.val(formattedContent);
                    target.toggleClass('active');
                },
                error : function(error) {
                    // FIXME: notify
                    console.log('error', error);
                    target.toggleClass('active');
                }
            });
        }

    });

    return DialogView;

});
