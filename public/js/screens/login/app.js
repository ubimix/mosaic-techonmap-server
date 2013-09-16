define(['./view'], function(LoginView) {
    return {
        run : function(viewManager, options) {
            var view = new LoginView(options);
            viewManager.show(view);
        }
    };
});