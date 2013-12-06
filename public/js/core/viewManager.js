define([ 'jQuery', './view.header' ], function($, HeaderView) {

    var viewManager = (function() {
        var currentView;
        // var theme =

        function showView(view) {
            disposeView(currentView, function() {
                render(view);
            });
        }

        function disposeView(view, callback) {
            if (!view) {
                return callback();
            }

            _disposeView(view);
            return callback();

            function _disposeView(view) {
                view.subviews && view.subviews.forEach(function(subview) {
                    _disposeView(subview);
                });

                view.remove();
            }
        }

        function render(view) {
            currentView = view;
            var header = $('#umx-header');
            var user = header.data('user');
            var roles = header.data('user-role');
            if (!this.headerView) {
                this.headerView = new HeaderView({
                    title : 'jscr-webui',
                    user : user,
                    roles : roles
                });
                $('#umx-header').html(this.headerView.$el);
            }
            this.headerView.render();
            $('#app').append(currentView.$el);
            currentView.render();

        }

        return {
            show : showView
        };
    })();

    return viewManager;
});