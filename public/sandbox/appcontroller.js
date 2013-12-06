(function(_, Backbone) {

    var StateController = Backbone.Model.extend({
        _ : function(name, value) {
            if (value === undefined)
                return this.get(name);
            this.set(name, value);
            return this;
        },
        parent : function(parent) {
            return this._('parent', parent);
        },
        name : function(name) {
            return this._('name', name);
        },
        clear : function() {
        },
        path : function(path) {
            if (path === undefined) {
                var parent = this.parent();
                var str = '';
                if (parent) {
                    str = parent.path();
                }
                var name = this.name() || '';
                if (str.length > 0) {
                    str += '/';
                }
                return str += name;
            }
            var array;
            if (_.isString(path)) {
                array = path.split('/');
            } else {
                array = _.toArray(path);
            }
            var node = this;
            while (node && array.length) {
                var segment = array.pop();
                if (segment == '')
                    segment = null;
                node.name(segment);
                node = node.parent();
            }
            return this;
        },
        _properties : function() {
            var that = this;
            _.each(arguments, function(name) {
                that[name] = function(value) {
                    return that._(name, value);
                }
            })
        }
    });
    var ResourceController = StateController.extend({
        initialize : function(parent) {
            this.type = 'RESOURCE';
            this.parent(parent);
            this._properties('state', 'mode', 'object');
        },
        clear : function() {
            this.name(null);
            this.state(null);
            this.mode(null);
            this.object(null);
        }
    })
    var ProjectController = StateController.extend({
        initialize : function(parent) {
            this.type = 'PROJECT';
            this.parent(parent);
            this.resource = new ResourceController(this);
        },
        clear : function() {
            this.name(null);
            this.resource.clear();
        }
    })
    var UserController = StateController.extend({
        initialize : function(parent) {
            this.type = 'USER';
            this.parent(parent);
            this._properties('role', 'object');
        },
        clear : function() {
            this.name(null);
            this.role(null);
            this.object(null);
        }
    })
    var WorkspaceController = StateController.extend({
        initialize : function(parent) {
            this.type = 'WORKSPACE';
            this.parent(parent);
            this.project = new ProjectController(this);
            this.user = new UserController(this);
            this._properties('object');
        },
        clear : function() {
            this.name(null);
            this.project.clear();
            this.user.clear();
        }
    })
    var AppController = StateController.extend({
        initialize : function(parent) {
            this.type = 'APPLICATION';
            this.parent(parent);
            this.workspace = new WorkspaceController(this);
        },
        clear : function() {
            this.name(null);
            this.workspace.clear();
        }
    })

    var app = new AppController();
    var print = function(prefix) {
        return function() {
            console.log(prefix, arguments);
        }
    }
    var n = app.workspace.project.resource;
    while (n) {
        n.on('change:name', print('[' + n.type + ']: '))
        n = n.parent();
    }

    var resource = app.workspace.project.resource;
    resource.path('APP/ws1/projQ/myResource');
    console.log('-----------------------------')
    console.log('app:', app.name())
    console.log('app.workspace:', app.workspace.name())
    console.log('app.workspace.project:', app.workspace.project.name())
    console.log('app.workspace.project.resource:',
            app.workspace.project.resource.name())

    resource.path('toto/ResourceTwo');
    console.log('-----------------------------')
    console.log('app:', app.name())
    console.log('app.workspace:', app.workspace.name())
    console.log('app.workspace.project:', app.workspace.project.name())
    console.log('app.workspace.project.resource:',
            app.workspace.project.resource.name())

    console.log('-----------------------------')
    console.log(app.workspace.project.resource.path())
    app.clear();
    console.log(app.workspace.project.resource.path())

})(_, Backbone);
