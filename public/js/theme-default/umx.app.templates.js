/**
 * This module is responsible for creation of all widget templates used by the
 * application. Each template is a function taking a data object as a parameter.
 * By default this module loads an HTML file containing 'script' elements marked
 * by the 'type="text/template"' type. Content of these elements is used to
 * automatically create resulting template functions. Identifiers of these
 * script blocks are used as names for the corresponding compiled templates.
 */

//TODO: why do we need to specify 'theme-techonmap' below (while we don't in the fractalstudio)

define([ 'jQuery', 'Underscore', 'Backbone', 'text!theme-techonmap/umx.app.templates.html' ],

function($, _, Backbone, HtmlTemplate) {

    /**
     * Load all elements containing the "type" (type="text/template") and "id"
     * attributes and transform their content to templates. Identifier of each
     * element is used as the template name.
     */
    var UmxTemplates = {};
    $(HtmlTemplate).find('[type="text/template"]').each(function() {
        var e = $(this);
        // All elements without identifiers are ignored.
        var id = e.attr('id');
        if (id) {
            var html = e.text();
            // Compile the HTML content to a template function
            var template = _.template(html);
            // Identifiers are used as template names
            UmxTemplates[id] = template;
        }
    })
    return UmxTemplates;
});