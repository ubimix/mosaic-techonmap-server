require([ 'require.config' ], function() {
    require([ 'jQuery', 'Underscore', './import', './fieldsmapping' ],
    //
    function($, _, Import, FieldsMapping) {
        function trim(str) {
            if (!str)
                return '';
            str = str.replace(/^\s+|\s+$/gim, '');
            return str;
        }
        function isEmpty(str) {
            return !str || str == '';
        }
        function resetId(obj) {
            obj.properties.id = Import.transformNameToId(obj.properties.name);
        }
        function convertTextToObjects(text) {
            var results = [];
            text = trim(text);
            if (isEmpty(text))
                return results;
            if (text[0] == '[') {
                var list = JSON.parse(text);
                results = results.concat(list);
            } else {
                var objects = Import.convertCsvToJson(text);
                var objTemplate = JSON
                        .stringify(FieldsMapping.CSV_TO_JSON.template);
                _.each(objects, function(object) {
                    var mappedObj = JSON.parse(objTemplate);
                    _.each(FieldsMapping.CSV_TO_JSON.mapping, function(m) {
                        var value = Import.selectFromObject(object, m.from);
                        if (m.transform) {
                            value = m.transform(value, mappedObj);
                        }
                        var path = m.to || 'properties/' + m.from;
                        Import.updateObject(mappedObj, path, value);
                    })
                    results.push(mappedObj);
                })
            }
            return results;
        }
        function checkObjects(objects) {
            // Check categories
            var defaultCategory = null;
            _.each(objects, function(object) {
                var category = object.properties.category;
                if (isEmpty(category)) {
                    if (!defaultCategory) {
                        var msg = 'Please define ' + 'a default category '
                                + 'for these entries:';
                        defaultCategory = prompt(msg);
                    }
                    object.properties.category = defaultCategory;
                }
            })

            // Fix/add identifiers
            _.each(objects, function(obj) {
                var id = obj.id;
                delete obj._id;
                delete obj.id;
                delete obj.dirty;
                if (!obj.properties.id) {
                    obj.properties.id = id;
                    if (!obj.properties.id) {
                        resetId(obj);
                    }
                }
            })

            // Fix urls
            _.each(objects, function(object) {
                _.each([ 'url', 'facebook', 'linkedin', 'viadeo' ], function(
                        name) {
                    var val = Import.checkUrl(object.properties[name]);
                    if (!isEmpty(val)) {
                        object.properties[name] = val;
                    } else {
                        delete object.properties[name];
                    }
                })
            })

        }

        function init() {
            var datasets = $('#datasets');
            var datasetTemplate = trim(datasets.html());
            datasets.html('');
            var resultsView = $('#results');

            var form = $('#input-form');
            var textarea = form.find('textarea');
            textarea.focus();
            var btnAdd = form.find('.btn-primary')
            var btnClear = form.find('.btn.clear');
            var btnMerge = resultsView.find('.btn.merge');
            function getText() {
                var val = trim(textarea.val());
                return val;
            }
            function clearText() {
                textarea.val('');
            }
            var data = {};
            setInterval(function() {
                var val = getText();
                if (isEmpty(val)) {
                    btnAdd.attr('disabled', 'disabled');
                    btnClear.attr('disabled', 'disabled');
                } else {
                    btnAdd.removeAttr('disabled');
                    btnClear.removeAttr('disabled');
                }
                var str = trim(datasets.html());
                if (!_.keys(data).length) {
                    btnMerge.attr('disabled', 'disabled');
                } else {
                    btnMerge.removeAttr('disabled');
                }
            }, 150)

            btnAdd.click(function() {
                var id = _.uniqueId();
                var text = getText();
                var objects = convertTextToObjects(text);
                checkObjects(objects);
                clearText();
                data[id] = objects;
                var dataset = $(datasetTemplate);
                dataset.appendTo(datasets);
                dataset.find('pre').text(JSON.stringify(objects, null, 2));
                dataset.find('.btn-primary').click(function() {
                    dataset.remove();
                    delete data[id];
                })
                dataset.removeClass('hidden');
            })
            btnClear.click(function() {
                clearText();
            });
            btnMerge.click(function(e) {
                var objectList = [];
                _.each(data, function(objects) {
                    objectList = objectList.concat(objects);
                })
                var regenerateIds = $('#regenerate-ids').is(':checked');
                console.log('REGENERATE:', regenerateIds)
                if (regenerateIds) {
                    objectList = JSON.parse(JSON.stringify(objectList));
                    _.each(objectList, resetId);
                }
                var result = Import.mergeJson(objectList, function(obj) {
                    var id = obj.properties.id || obj.id;
                    return id;
                })
                result.sort(function(first, second) {
                    var a = first.properties.name || '';
                    var b = second.properties.name || '';
                    a = a.toLowerCase();
                    b = b.toLowerCase();
                    return a > b ? 1 : a < b ? -1 : 0;
                })

                var type = $(e.target).data('format');
                var str = '';
                if (type == 'json') {
                    str = JSON.stringify(result, null, 2);
                } else if (type == 'csv') {
                    str = Import.convertJsonToCsv(result,
                            FieldsMapping.JSON_TO_CSV.mapping);
                }
                var dataField = resultsView.find('.data');
                dataField.val(str);
                dataField.removeClass('hidden');
                dataField.focus()
                setTimeout(function() {
                    dataField.select();
                }, 10)
            });
        }

        $(init);
    });
})
