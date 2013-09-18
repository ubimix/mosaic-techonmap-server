define([ 'Backbone', 'text!./view.html','jQueryCsv','utils'], function(Backbone, template, jQueryCsv, Utils) {
    
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
            var data = this.$el.find('#csv').val();
            var category = this.$el.find('#category').val();
            var array = jQueryCsv.toArrays(data);
            var geoitems = Utils.toGeoJson(category, array);
            // TODO: why can't we send plain arrays . Why do we need a map ?
            $.ajax({
                type: 'POST',
                url: '/api/resources/import',
                data: {data: geoitems},
                success: onImport,
                dataType: 'json'
              });
            
            function onImport(result) {
                console.log(result);
            }
            
        }
        
        
        

    });
    return View;

});
