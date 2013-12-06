define([ 'Underscore', 'utils', '../../models/ResourceCollection',
        '../commons/Dialog', 'text!./export.html', 'BootstrapModal' ],

function(_, Utils, ResourceCollection, Dialog, Template) {

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
            this._exportResources(target, this.toCsv);
        },

        _exportResources : function(target, convert) {
            var that = this;
            var textarea = this.$('.export-content');
            textarea.val('');
            var coll = new ResourceCollection();
            coll.fetch({
                success : function(coll) {
                    _.each(coll.models, function(item, index) {
                        // add permalink
                        Utils.updateObject(item,
                                'attributes.properties.permalink', item
                                        .buildPermalink());
                        item.deleteSysAttributes();
                    });
                    var formattedContent = convert(coll);
                    textarea.val(formattedContent);
                    textarea.focus();
                    textarea.select();
                    target.toggleClass('active');
                },
                error : function(error) {
                    // FIXME: notify
                    console.log('error', error);
                    target.toggleClass('active');
                }
            });
        },

        toCsv : function(collection) {
            function escape(str) {
                str = str ? '' + str : '';
                str = str.replace(/[\r\n\t]+/gi, ' ');
                str = str.replace(/["]/gi, "'");
                if (str.indexOf(',') > 0) {
                    str = '"' + str + '"';
                }
                return str;
            }
            function serializeArray(array, delimiter) {
                delimiter = delimiter || ',';
                return array.join(delimiter);
            }
            function formatCSV(resource) {
                var array = [];
                var properties = resource.getProperties() || {};
                var coordinates = resource.getGeometry()
                        && resource.getGeometry().coordinates || [];

                array.push(properties.id);
                array.push(properties.name);
                array.push(properties.description);
                var tags = properties.tags || [];
                array.push(tags[0]);
                array.push(tags[1]);
                array.push(tags[2]);
                array.push(coordinates[1]);
                array.push(coordinates[0]);
                array.push(properties.address);
                array.push(properties.postcode);
                array.push(properties.city);
                array.push(properties.creationyear);
                array.push(properties.url);
                array.push(properties.email);
                array.push(properties.twitter);
                array.push(properties.facebook);
                array.push(properties.googleplus);
                array.push(properties.linkedin);
                array.push(properties.viadeo);
                array.push(properties.category);
                array.push(resource.buildPermalink());
                for ( var i = 0; i < array.length; i++) {
                    array[i] = escape(array[i]);
                }
                var str = serializeArray(array);
                return str;
            }
            var lines = [];

            var headers = _.keys(Utils.fieldMapping);
            headers.push('Permalien');

            lines.push(serializeArray(headers));

            for ( var i = 0; i < collection.models.length; i++) {
                var line = formatCSV(collection.models[i]);
                lines.push(line);
            }
            var str = serializeArray(lines, '\n');
            return str;
        }

    });

    return DialogView;

});
