define(function(require) {
    var LoginView = require('./view');
    return {
        run : function(viewManager, options) {
            var view = new LoginView(options);
            viewManager.show(view);
        }
    };
});