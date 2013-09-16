define([ './view' ], function(LoginView) {
    return {
        run : function(viewManager, options) {

            $.get('/api/auth/user', function(user) {
                var view = new LoginView({
                    user : user,
                });
                viewManager.show(view);
            }, 'json');

        }
    };
});