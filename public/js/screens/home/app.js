define(function(require) {
    var View = require('./view');
    return {
        run : function(viewManager, options) {
            var view = new View(options);
            viewManager.show(view);
        }
    };
});