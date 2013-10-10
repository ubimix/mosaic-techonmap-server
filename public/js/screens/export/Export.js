define([ 'Backbone', 'Underscore', '../collections/ResourceCollection', '../commons/Dialog', 'text!./export.html',
        'BootstrapModal' ],

function(Backbone, _, ResourceCollection, Dialog, Template) {

    var DialogView = Dialog.extend({
        
        initialize : function() {
            
        },

        template : _.template(Template),

        events : {
            'click .export-json' : 'jsonExportClicked',
            'click .export-csv' : 'csvExportClicked'
        },

        jsonExportClicked : function(event) {
            var target = $(event.currentTarget);
            target.toggleClass('active');
            this.exportResources(target, function(collection) {
                return JSON.stringify(collection.models, null, 2);    
            });
        },
        
        csvExportClicked : function(event) {
            var target = $(event.currentTarget);
            target.toggleClass('active');
            this.exportResources(target, function(collection) {
                return JSON.stringify(collection.models, null, 2);    
            });
        },
        
        exportResources : function(target, convert) {
            this.$('.export-content').val('');
            var coll = new ResourceCollection();
            var that = this;
            coll.fetch({
                success : function(coll) {
                    _.each(coll.models, function(item, index) {
                       item.deleteSysAttributes();
                    });
                    var formattedContent = convert(coll);
                    that.$('.export-content').val(formattedContent);
                    target.toggleClass('active');
                },
                error : function(error) {
                    console.log('error', error);
                    target.toggleClass('active');
                }
            });
        }

    });

    return DialogView;

});
