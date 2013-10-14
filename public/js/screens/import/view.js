define(
        [ '../commons/UmxView', 'Underscore', 'jQueryCsv', 'CodeMirror',
                'Handsontable', 'utils', '../commons/Dialog',
                'text!./ImportView.html', 'text!./TableView.html',
                'text!./TextView.html' ],

        function(UmxView, _, jQueryCsv, CodeMirror, Handsontable, Utils,
                Dialog, ImportViewTemplate, TableViewTemplate, TextViewTemplate) {

            var TableView = UmxView.extend({
                initialize : function(options) {
                    this.data = this.options.data;
                },
                template : _.template(TableViewTemplate),
                renderContainer : function() {
                    return this.asyncElement(function(elm) {
                        elm.handsontable({
                            data : this.data,
                            readOnly : true,
                            rowHeaders : true,
                            colHeaders : true,
                            colWidths : [ 60, 80 ]
                        });
                    })
                }
            });

            var TextView = UmxView.extend({
                template : _.template(TextViewTemplate),
                renderCsvEditor : function() {
                    return this.asyncElement(function(el) {
                        var columnsElm = el.find('.columnNames');
                        columnsElm.remove();
                        this.csvEditor = Utils.newCodeMirror(el[0], {}, false,
                                '');
                        var text = columnsElm.text();
                        text = text.replace(/[\r\n]+/gim, ' ').replace(
                                /\s+/gim, ' ');
                        var columns = text.split(/\s*,\s*/gim);
                        console.log('COLUMNS:', columns)
                        this.setValue(columns.join(', '));
                    })
                },
                getValue : function() {
                    return this.csvEditor.getValue();
                },
                setValue : function(value) {
                    this.csvEditor.setValue(value);
                }
            });

            var ImportView = UmxView
                    .extend({
                        initialize : function() {
                            _.bindAll(this, 'onImported', 'importCsv',
                                    'nextClicked', 'previousClicked');
                        },
                        template : _.template(ImportViewTemplate),

                        renderBtnPrevious : function() {
                            return this.asyncElement(function(elm) {
                                this.btnPrevious = elm;
                                this.btnPrevious.attr('disabled', 'disabled');
                                this.btnPrevious.click(this.previousClicked)
                            })
                        },
                        renderBtnImport : function() {
                            return this.asyncElement(function(elm) {
                                this.btnImport = elm;
                                this.btnImport.attr('disabled', 'disabled');
                                this.btnImport.click(this.importCsv);
                            })
                        },
                        renderBtnNext : function() {
                            return this.asyncElement(function(elm) {
                                this.btnNext = elm;
                                // this.btnNext.attr('disabled', 'disabled');
                                this.btnNext.click(this.nextClicked);
                            })
                        },
                        renderWizard : function() {
                            return this.asyncElement(function(elm) {
                                this.wizardElm = elm;
                                this.showTextView();
                            })
                        },

                        nextClicked : function() {
                            if (this.showTableView()) {
                                this.btnPrevious.removeAttr('disabled');
                                this.btnImport.removeAttr('disabled');
                                this.btnImport.addClass('btn-primary');
                                this.btnNext.removeClass('btn-primary');
                                this.btnNext.attr('disabled', 'disabled');
                            }

                        },

                        showTableView : function() {
                            try {
                                var data = this.csvToArray();
                                this.textView.remove();
                                this.tableView = new TableView({
                                    data : data
                                });
                                this.wizardElm.append(this.tableView.$el);
                                this.tableView.render();
                                return true;
                            } catch (e) {
                                Utils
                                        .showOkDialog('Erreur',
                                                'Une erreur s\'est produite, merci de vérifier le contenu CSV.');
                                return false;
                            }
                        },
                        showTextView : function() {
                            this.textView = new TextView();
                            this.wizardElm.append(this.textView.$el);
                            this.textView.render();
                        },
                        previousClicked : function() {
                            this.btnImport.attr('disabled', 'disabled');
                            this.btnImport.removeClass('btn-primary');
                            this.btnNext.addClass('btn-primary');
                            this.btnNext.removeAttr('disabled');
                            this.btnPrevious.attr('disabled', 'disabled');
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
                            var array = jQueryCsv.toArrays(this.csvValue,
                                    options);
                            return array;
                        },

                        importCsv : function() {
                            var geoitems = Utils.toGeoJson(this.csvToArray());
                            if (geoitems.length == 0) {
                                return Utils
                                        .showOkDialog(
                                                'Erreur',
                                                'Données insuffisantes. Veillez à ce que la première ligne contienne le nom des champs.');
                            }
                            // TODO: why can't we send plain arrays . Why do we
                            // need a
                            // map ?

                            // TODO: use a Backbone collection so that the
                            // returned
                            // objects
                            // are
                            // Resources
                            $.post('/api/resources/import', {
                                data : geoitems
                            }).done(this.onImported).fail(
                                    function(err) {
                                        return Utils.showOkDialog('Erreur',
                                                'Une erreur s\'est produite lors de l\'enregistrement : '
                                                        + err.name + ' - '
                                                        + err.message);
                                    });

                        },

                        onImported : function(result) {
                            // createReport(result.updated, 'updated'));
                            var title = this.$('.dialog-import .title').html();
                            var content = this.createReport(result,
                                    'créées ou mises à jour').html();
                            return Utils.showOkDialog(title, content);
                        },

                        createReport : function(entryList, term) {
                            var buffer = '';
                            var counter = 0;
                            _.each(entryList, function(item, key) {
                                if (counter > 0)
                                    buffer += ' -';
                                buffer += '<a href="/workspace/'
                                        + item.properties.id + '">'
                                        + item.properties.name + '</a>';
                                counter++;
                            });
                            var length = _.keys(entryList).length;
                            if (length > 0)
                                return $('<div>' + length + ' entités ont été '
                                        + term + ' :' + buffer + '.</div>');
                            return $('<div>' + length + ' entités ont été '
                                    + term + '.</div>');

                        }

                    });
            return ImportView;

        });
