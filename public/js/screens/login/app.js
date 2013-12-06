define([ './LoginView' ], function(LoginView) {
    return {
        run : function(viewManager, options) {
            // FIXME: replace this direct call by a model call
            $.get('/api/auth/user', function(user) {
                var view = new LoginView({
                    user : user,
                });
                viewManager.show(view);
            }, 'json');

        }
    };
});