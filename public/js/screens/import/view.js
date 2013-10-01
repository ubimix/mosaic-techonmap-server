define([ 'Backbone', 'Underscore', 'jQueryCsv', 'CodeMirror', 'utils', '../commons/Dialog', 'text!./view.html' ],

function(Backbone, _, jQueryCsv, CodeMirror, Utils, Dialog, template) {

    var View = Backbone.View.extend({

        initialize : function() {
            _.bindAll(this, 'onImported');
        },
        template : _.template(template),
        events : {
            'click .import' : 'importCsv'
        },

        render : function() {
            this.$el.html(this.template({
                workspace : this.options.workspace
            }));

            return this;
        },

        importCsv : function() {
            // var data = this.$el.find('#content').val();
            var data = editor.getValue();
            var geoitems;
            try {
                var array = jQueryCsv.toArrays(data);
                geoitems = Utils.toGeoJson(array);
            } catch (e) {
                return Utils.showOkDialog('Error', 'An error occurred, please check your CSV input.');

            }

            // TODO: why can't we send plain arrays . Why do we need a
            // map ?

            // TODO: use a Backbone collection so that the returned objects
            // are
            // Resources
            $.post('/api/resources/import', {
                data : geoitems
            }).done(this.onImported).fail(function(err) {
                return Utils.showOkDialog('Error', 'An error occurred while saving the data : ' + err.name + ' - ' + err.message);
            });

        },

        onImported : function(result) {
            // createReport(result.updated, 'updated'));
            var title = this.$el.find('.dialog-import .title').html();
            var content = this.createReport(result, 'created or updated').html();
            return Utils.showOkDialog(title, content);
        },

        createReport : function(entryList, term) {
            var buffer = '';
            _.each(entryList, function(item, index) {
                if (index > 0)
                    buffer += ' -';
                buffer += ' <a href="/workspace/' + item.properties.id + '">' + item.properties.name + '</a>';
            });
            if (entryList.length > 0)
                return $('<div>' + entryList.length + ' entities have been ' + term + ':' + buffer + '.</div>');
            return $('<div>' + entryList.length + ' entities have been ' + term + '.</div>');

        }

    });
    return View;

});
