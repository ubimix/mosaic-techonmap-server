define([ 'jQuery', 'Underscore', 'jQueryCsv' ], function($, _) {

    return {
        /**
         * Loads and returns a value from an object using the specified field
         * path.
         */
        selectFromObject : selectFromObject,

        /**
         * Updates an object using the specified field path with the given
         * values.
         */
        updateObject : updateObject,

        /**
         * Convert a CSV file to a JSON object. The first line is used as a
         * field name.
         */
        convertCsvToJson : convertCsvToJson,

        /**
         * Convert a JSON object to a CSV file using the specified mapping.
         */
        convertJsonToCsv : convertJsonToCsv,

        /**
         * Merges the specified JSON objects. The specified merge function takes
         * a list of objects with the same identifier and returns the merged
         * result.
         */
        mergeJson : mergeJson,

        /**
         * Transforms one JSON object into another using the specified mapping.
         */
        mapJson : mapJson,

        transformNameToId : transformNameToId,

        checkUrl : checkUrl

    }

    /**
     * Convert a CSV file to a JSON object. The first line is used as a field
     * name.
     */
    function convertCsvToJson(text) {
        var data = $.csv.toArrays(text);
        var firstRow = _.first(data);
        data = _.rest(data);
        return _.map(data, function(line) {
            var obj = {};
            var col = 0;
            _.each(firstRow, function(key) {
                obj[key] = line[col++];
            })
            return obj;
        })
    }

    /**
     * Convert a JSON object to a CSV file using the specified mapping.
     * 
     * @param data
     *            an array of objects to map
     * @param mapping
     *            a mapping object defining how values from the object should be
     *            mapped to the CSV cells; this object contains the following
     *            fields: 1) "from" - a path to the value in the object 2) "to" -
     *            the name of the CSV column where the value should be mapped 3)
     *            "transform" an optional function transforming the object field
     *            value into the final CSV cell value
     */
    function convertJsonToCsv(data, mapping) {
        function escape(str) {
            if (str === null || str === undefined)
                return '';
            if (!_.isString(str))
                str += '';
            str = str.replace(/"/gim, '""');
            str = str.replace(/([\\|])/gim, '\\$1');
            str = str.replace(/(\r\n|\r|\n)/gim, '\\n');
            str = str.replace(/[\t]/gim, '\\t');
            if (str.indexOf(',') > 0 || str.indexOf('"') > 0) {
                return '"' + str + '"';
            }
            return str;
        }
        var array = [];
        var line = [];
        array.push(line);
        _.each(mapping, function(m) {
            line.push(escape(m.to));
        });
        _.each(data, function(obj) {
            var line = [];
            array.push(line);
            _.each(mapping, function(m) {
                var value = selectFromObject(obj, m.from);
                if (m.transform) {
                    value = m.transform(value, result);
                }
                line.push(escape(value));
            })
        })
        var str = _.map(array, function(line) {
            return line.join(',');
        }).join('\n');
        return str;
    }

    /** Transforms one JSON object into another using the specified mapping */
    function mapJson(mapping, json) {
        return json;
    }

    /**
     * Merges the specified JSON objects. The specified merge function takes a
     * list of objects with the same identifier and returns the merged result.
     */
    function mergeJson(list, idLoader, merge) {
        merge = merge
                || function defaultMerge(objects) {
                    var result = {};
                    _.each(objects, function(object) {
                        _.each(_.keys(object), function(key) {
                            var oldValue = result[key];
                            var newValue = object[key];
                            var value;
                            if (oldValue === undefined) {
                                value = newValue;
                            } else if (_.isObject(oldValue)
                                    && _.isObject(newValue)
                                    && !_.isArray(oldValue)
                                    && !_.isArray(newValue)) {
                                value = defaultMerge([ oldValue, newValue ]);
                            }
                            if (value !== undefined) {
                                result[key] = value;
                            }
                        })
                    });
                    return result;
                }
        var mapping = {};
        _.each(list, function(obj) {
            var id = idLoader(obj);
            var l = mapping[id] = mapping[id] || [];
            l.push(obj);
        })
        var result = [];
        _.each(mapping, function(l) {
            var obj = merge(l);
            result.push(obj);
        })
        return result;
    }

    /** Splits the given path (selector) to individual segments */
    function splitSelector(str) {
        return str.split('/');
    }

    /** Loads and returns a value from an object using the specified field path. */
    function selectFromObject(node, path) {
        var array = splitSelector(path);
        var n = node;
        _.each(array, function(segment) {
            if (n) {
                if (_.isArray(n) && segment.match(/^\d+$/)) {
                    segment = parseInt(segment);
                }
                n = n[segment];
            }
        })
        return n;
    }

    /** Updates an object using the specified field path with the given values */
    function updateObject(node, path, value) {
        var array = splitSelector(path);
        var n = node;
        var container = n;
        var len = array.length - 1;
        for ( var i = 0; i < len; i++) {
            var segment = array[i];
            if (_.isArray(n) && segment.match(/^\d+$/)) {
                segment = parseInt(segment);
            }
            container = n[segment];
            if (container == null) {
                var nextSegment = array[i + 1];
                if (nextSegment && nextSegment.match(/^\d+$/)) {
                    container = [];
                } else {
                    container = {};
                }
                n[segment] = container;
            }
            n = container;
        }
        var result = false;
        var prop = array[len];
        if (container && value && value != '') {
            container[prop] = value;
            result = true;
        }
        return result;
    }

    function checkUrl(value) {
        if (!value || value == '')
            return '';
        if (value.indexOf('://') < 0) {
            value = 'http://' + value;
        }
        return value;
    }

    function transformNameToId(value) {
        if (!value)
            return '';
        if (!_.isString(value))
            value += '';
        value = value.replace(/\+/gim, '-plus-');
        value = value.replace(/['"\s@&]+/gim, '-');
        value = value.replace(/-+/gim, '-');
        value = value.replace(/^-|-$/gim, '');
        value = value.toLowerCase();
        return value;
    }

})
