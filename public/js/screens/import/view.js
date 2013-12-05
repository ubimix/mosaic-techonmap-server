define([ '../commons/UmxView', 'Underscore', 'jQueryCsv', 'CodeMirror',
        'Handsontable', 'utils', '../commons/Dialog', 'text!./ImportView.html',
        'text!./TableView.html', 'text!./TextView.html' ],

function(UmxView, _, jQueryCsv, CodeMirror, Handsontable, Utils, Dialog,
        ImportViewTemplate, TableViewTemplate, TextViewTemplate) {

    var TableView = UmxView.extend({
        initialize : function(options) {
            this.isRendered = false;
            this.setData(this.options.data);
        },
        _refreshTable : function() {
            var that = this;
            if (that.isRendered && that.data) {
                that.$el.handsontable({
                    data : that.data,
                    readOnly : true,
                    rowHeaders : true,
                    colHeaders : true,
                    colWidths : [ 60, 80 ]
                });
            }
        },
        setData : function(data) {
            this.data = data;
            this._refreshTable();
        },
        onRender : function() {
            this.isRendered = true;
            this._refreshTable();
        },
        hide : function() {
            this.$el.hide();
        },
        show : function() {
            this.$el.show();
        }
    });

    var TextView = UmxView.extend({
        renderCsvEditor : function(elm) {
            var text = elm.text();
            elm.remove();
            this.csvEditor = Utils.newCodeMirror(this.$el[0], {}, false, '');
            text = text.replace(/[\r\n]+/gim, ' ').replace(/\s+/gim, ' ');
            var columns = text.split(/\s*,\s*/gim);
            this.setValue(columns.join(', '));
        },
        hide : function() {
            this.$el.hide();
        },
        show : function() {
            this.$el.show();
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
                    _.bindAll(this, 'onImported', 'importCsv', 'nextClicked',
                            'previousClicked');
                },
                template : _.template(ImportViewTemplate),

                renderBtnPrevious : function(elm) {
                    this.btnPrevious = elm;
                    this.btnPrevious.attr('disabled', 'disabled');
                    this.btnPrevious.click(this.previousClicked)
                },
                renderBtnImport : function(elm) {
                    this.btnImport = elm;
                    this.btnImport.attr('disabled', 'disabled');
                    this.btnImport.click(this.importCsv);
                },
                renderBtnNext : function(elm) {
                    this.btnNext = elm;
                    // this.btnNext.attr('disabled', 'disabled');
                    this.btnNext.click(this.nextClicked);
                },
                renderWizard : function(elm) {
                    this.wizardElm = elm;
                },
                renderTextView : function(elm) {
                    this.textView = new TextView({
                        el : elm
                    }).render();
                },
                renderTableView : function(elm) {
                    this.tableView = new TableView({
                        el : elm
                    }).render();
                    this.tableView.hide();
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
                        this.textView.hide();
                        var data = this.csvToArray();
                        this.tableView.setData(data);
                        this.tableView.show();
                        return true;
                    } catch (e) {
                        // FIXME: externalize this message
                        var msg = 'Une erreur s\'est produite, '
                                + 'merci de vérifier le contenu CSV.';
                        Utils.showOkDialog('Erreur', msg);
                        this.textView.show();
                        this.tableView.hide();
                        return false;
                    }
                },
                showTextView : function() {
                    this.tableView.hide();
                    this.textView.show();
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
                    this.csvValue = this.textView.getValue();
                    var array = jQueryCsv.toArrays(this.csvValue, options);
                    return array;
                },

                importCsv : function() {
                    var geoitems = Utils.toGeoJson(this.csvToArray());
                    if (geoitems.length == 0) {
                        var msg = 'Données insuffisantes. '
                                + 'Veillez à ce que '
                                + 'la première ligne contienne '
                                + 'le nom des champs.';
                        return Utils.showOkDialog('Erreur', msg);
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
                                var msg = 'Une erreur s\'est produite '
                                        + 'lors de l\'enregistrement : '
                                        + err.name + ' - ' + err.message;
                                return Utils.showOkDialog('Erreur', msg);
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
                        buffer += '<a href="/workspace/' + item.properties.id
                                + '">' + item.properties.name + '</a>';
                        counter++;
                    });
                    var length = _.keys(entryList).length;
                    if (length > 0)
                        return $('<div>' + length + ' entités ont été ' + term
                                + ' :' + buffer + '.</div>');
                    return $('<div>' + length + ' entités ont été ' + term
                            + '.</div>');

                }

            });
    return ImportView;

});
