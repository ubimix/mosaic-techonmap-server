define([ 'Backbone', 'jQueryCsv', 'CodeMirror', 'text!./view.html', 'utils' ], function(Backbone, jQueryCsv, CodeMirror, template, Utils) {

    var View = Backbone.View.extend({
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
            //var data = this.$el.find('#content').val();
            var data = editor.getValue();
            var array = jQueryCsv.toArrays(data);
            var geoitems = Utils.toGeoJson('', array);
            // TODO: why can't we send plain arrays . Why do we need a
            // map ?
            $.ajax({
                type : 'POST',
                url : '/api/resources/import',
                data : {
                    data : geoitems
                },
                success : onImported,
                dataType : 'json',
                error : onImportedError
            });

            function onImported(result) {
                console.log(result);
                //clear previous reports
                $('#import-report').html('');
                $('#import-report').append(createReport(result.created, 'created')).append(
                        createReport(result.updated, 'updated'));
                $('#dialog-import-ok').modal();
            }

            function createReport(entryList, term) {
                var buffer = '';
                _.each(entryList, function(item, index) {
                    if (index > 0)
                        buffer += ' -';
                    buffer += ' <a href="/workspace/' + item.id + '">' + item.name + '</a>';
                });
                if (entryList.length > 0)
                    return $('<li>' + entryList.length + ' entities have been ' + term + ':' + buffer + '.</li>');
                return $('<li>' + entryList.length + ' entities have been ' + term + '.</li>');

            }

            function onImportedError(error) {
                console.log(error);
            }

        }

    });
    return View;

});
