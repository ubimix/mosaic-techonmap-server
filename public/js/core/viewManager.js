define([ 'jQuery', './view.header' ], function($, HeaderView) {

    var viewManager = (function() {
        var currentView;
        //var theme = 

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
            $('#app').html(currentView.el);
            var headerLoaded = $('#header').data('loaded');
            var user = $('#header').data('user');
            if (!headerLoaded) {
                var headerView = new HeaderView({
                    title : 'jscr-webui',
                    user : user
                });
                $('#header').html(headerView.el);
                headerView.render();
                $('#header').data('loaded', 'true');
            }

            currentView.render();
        }

        return {
            show : showView
        };
    })();

    return viewManager;
});