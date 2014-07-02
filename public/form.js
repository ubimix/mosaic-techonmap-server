
jQuery(function() {

    var marker = null;
    function trim(str) {
        return str ? str.replace(/^\s+|\s+$/g, '') : '';
    }

    var form = jQuery('#edit-form')
    form.parsley();

    jQuery('input[type=submit]').click(
            function() {
                try {
                    // var valid = form.parsley('validate')
                    var errors = {};
                    var result = getDataFromForm(errors);
                    console.log(result);
                    var valid = true;
                    for ( var key in errors) {
                        errors[key].forEach(function(val) {
                            if (val.required) {
                                valid = false;
                                console.log('ERRORS:', val);
                            }
                        })
                    }
                    if (valid) {
                        var elm = $(this);

                        console.log('sending...');

                        config = {};
                        config.host = 'http://localhost:9000'
                        config.username = 'arkub'
                        config.password = '[leliendéfait]';
                        config.appcode = '1234567890';
                        
                        var session = 

                        superagent.post(config.host + '/login').send(config)
                                .set('Content-Type', 'application/x-www-form-urlencoded').end(function(error, res) {
                                    if (error)
                                        throw new Error(error)
                                    var session = res.body.data['X-BB-SESSION'];
                                    var roles = res.body.data.user.roles;
                                    console.log(res);
                                    console.log(session);

                                });

                    }
                } catch (e) {
                    console.log(e);
                }
                return false;
            });

    function getDataFromForm(errors) {
        var formFields = {};

        function setFormField(formElm) {
            var name = jQuery(formElm).attr('name');
            // var value = properties[name];
            var value = jQuery(formElm).val();
            if (jQuery.type(value) === 'array') {
                // setFields(name, value);
            } else {
                // setField(name, value);
                formFields[name] = value;
            }
        }

        jQuery('.form input[name]').each(function() {
            setFormField(this);
        });
        jQuery('.form textarea[name]').each(function() {
            setFormField(this);
        });

        // TODO add form elements that are not inputs nor textareas

        console.log('formFields', formFields);

        errors = errors || {};
        var coordinates = [];
        var properties = {};
        var result = {
            type : "Feature",
            geometry : {
                type : "Point",
                coordinates : coordinates
            },
            properties : properties
        };

        // var category = categorySelector.find('options:selected').data(
        // 'category-id');
        // properties.category = category;
        return result;
    }

});