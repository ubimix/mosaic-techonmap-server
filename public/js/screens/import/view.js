define(
        [ 'Backbone', 'Underscore', 'jQueryCsv', 'CodeMirror', 'Handsontable', 'utils', '../commons/Dialog', 'text!./view.html' ],

        function(Backbone, _, jQueryCsv, CodeMirror, Handsontable, Utils, Dialog, template) {

            var TableView = Backbone.View.extend({
                initialize : function(options) {
                    this.data = this.options.data;
                },
                render : function() {
                    this.$el.html('<div class="import-table"></div>');
                    var $container = this.$('.import-table');

                    $container.handsontable({
                        data : this.data,
                        readOnly : true,
                        rowHeaders : true,
                        colHeaders : true,
                        colWidths : [ 60, 80 ]
                    });
                    return this;
                }
            });

            var TextView = Backbone.View
                    .extend({
                        render : function() {
                            this.$el.html('<div class="content"></div>');
                            this.csvEditor = Utils.newCodeMirror(this.$el.find('.content').get(0), {}, false, '');
                            this
                                    .setValue('Identifiant,Nom,Description,Tag 1,Tag 2,Tag 3,Latitude,Longitude,N° et nom de rue,CP,Ville,Année de création,Url site web,Nom compte Twitter,Url page Facebook,Url page Google +,Url page Linkedin,Url page Viadeo,Catégorie');
                            return this;
                        },

                        getValue : function() {
                            return this.csvEditor.getValue();
                        },

                        setValue : function(value) {
                            this.csvEditor.setValue(value);
                        }
                    });

            var View = Backbone.View.extend({

                initialize : function() {
                    _.bindAll(this, 'onImported');
                },
                template : _.template(template),
                events : {
                    'click .import' : 'importCsv',
                    'click .next' : 'nextClicked',
                    'click .previous' : 'previousClicked'
                },

                render : function() {
                    this.$el.html(this.template({
                        workspace : this.options.workspace
                    }));

                    this.$('.import').attr('disabled', 'disabled');
                    this.$('.previous').attr('disabled', 'disabled');

                    this.showTextView();

                    return this;
                },

                nextClicked : function() {
                    if (this.showTableView()) {
                        this.$('.previous').removeAttr('disabled');
                        this.$('.import').removeAttr('disabled');
                        this.$('.next').removeClass('btn-primary');
                        this.$('.next').attr('disabled', 'disabled');
                        this.$('.import').addClass('btn-primary');
                    }

                },

                showTextView : function() {
                    this.textView = new TextView();
                    this.$('#wizard').append(this.textView.$el);
                    this.textView.render();
                },

                showTableView : function() {
                    try {
                        var data = this.csvToArray();
                        this.textView.remove();
                        this.tableView = new TableView({
                            data : data
                        });
                        $("#wizard").append(this.tableView.$el);
                        this.tableView.render();
                        return true;
                    } catch (e) {
                        Utils.showOkDialog('Erreur', 'Une erreur s\'est produite, merci de vérifier le contenu CSV.');
                        return false;
                    }

                },

                previousClicked : function() {
                    this.$('.import').attr('disabled', 'disabled');
                    this.$('.import').removeClass('btn-primary');
                    this.$('.next').addClass('btn-primary');
                    this.$('.next').removeAttr('disabled');
                    this.$('.previous').attr('disabled', 'disabled');
                    this.tableView.remove();
                    this.showTextView();
                    this.textView.setValue(this.csvValue);
                },

                csvToArray : function() {
                    var options = {
                        separator : this.$('.separator').val(),
                        delimiter : this.$('.delimiter').val()
                    };
                    console.log('options', options);
                    this.csvValue = this.textView.getValue();
                    var array = jQueryCsv.toArrays(this.csvValue, options);
                    return array;
                },

                importCsv : function() {
                    var geoitems = Utils.toGeoJson(this.csvToArray());
                    if (geoitems.length == 0) {
                        return Utils.showOkDialog('Erreur',
                                'Données insuffisantes. Veillez à ce que la première ligne contienne le nom des champs.');
                    }
                    // TODO: why can't we send plain arrays . Why do we need a
                    // map ?

                    // TODO: use a Backbone collection so that the returned
                    // objects
                    // are
                    // Resources
                    $.post('/api/resources/import', {
                        data : geoitems
                    }).done(this.onImported).fail(
                            function(err) {
                                return Utils.showOkDialog('Erreur', 'Une erreur s\'est produite lors de l\'enregistrement : '
                                        + err.name + ' - ' + err.message);
                            });

                },

                onImported : function(result) {
                    // createReport(result.updated, 'updated'));
                    var title = this.$('.dialog-import .title').html();
                    var content = this.createReport(result, 'créées ou mises à jour').html();
                    return Utils.showOkDialog(title, content);
                },

                createReport : function(entryList, term) {
                    var buffer = '';
                    var counter = 0;
                    _.each(entryList, function(item, key) {
                        if (counter > 0)
                            buffer += ' -';
                        buffer += '<a href="/workspace/' + item.properties.id + '">' + item.properties.name + '</a>';
                        counter++;
                    });
                    var length = _.keys(entryList).length;
                    if (length > 0)
                        return $('<div>' + length + ' entités ont été ' + term + ' :' + buffer + '.</div>');
                    return $('<div>' + length + ' entités ont été ' + term + '.</div>');

                }

            });
            return View;

        });
