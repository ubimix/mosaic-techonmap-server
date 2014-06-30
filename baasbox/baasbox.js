/*
Copyright 2014 - BAASBOX srl

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var BaasBox = (function () {
    
    var instance;
    var user;
    var endPoint;
    var COOKIE_KEY = "baasbox-cookie";

    // permission constants
    var READ_PERMISSION = "read";
    var DELETE_PERMISSION = "delete";
    var UPDATE_PERMISSION = "update";

    // role constants, by default in the BaasBox back end
    var ANONYMOUS_ROLE = "anonymous";
    var REGISTERED_ROLE = "registered"
    var ADMINISTRATOR_ROLE = "administrator"

	$.ajaxSetup({
        global: true,
        beforeSend: function (r, settings) {
            if(BaasBox.getCurrentUser()){
                r.setRequestHeader('X-BB-SESSION', BaasBox.getCurrentUser().token);    
            }
            r.setRequestHeader('X-BAASBOX-APPCODE', BaasBox.appcode);
        }
    });

    function createInstance() {

        var object = new Object("I am the BaasBox instance");
        return object;

    }

    function setCurrentUser(userObject) {
        
		if (userObject == null)
			return;
			
        this.user = userObject;
        $.cookie(COOKIE_KEY, JSON.stringify(this.user));
        
    }

    function getCurrentUser() {
        
        if ($.cookie(COOKIE_KEY)) {
            
            this.user = JSON.parse($.cookie(COOKIE_KEY));
            
        }
        
        return this.user;
        
    }
    
    return {

        appcode: "",
        pagelength: 50,
        version: "0.3.6",

        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },

        setEndPoint : function (endPointURL) {
            
            var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/

            if (regexp.test(endPointURL)) {
                
                this.endPoint = endPointURL;
                
            } else {
                
                alert(endPointURL + " is not a valid URL");
                
            }
                        
        },
        
        endPoint: function () { 
            return this.endPoint;
        },

        login: function (user, pass, cb) {
            
            var url = BaasBox.endPoint + '/login'
            var req = $.post(url, {
                username: user,
                password: pass,
                appcode: BaasBox.appcode
            })
                .done(function (res) {
                    var roles = [];

                    $(res.data.user.roles).each(function(idx,r){
                        roles.push(r.name);
                    })

                    setCurrentUser({"username" : res.data.user.name, 
									"token" : res.data['X-BB-SESSION'], 
									"roles": roles});
                    var u = getCurrentUser()
                    console.log("current user " + u);
                    cb(u,null);
                })
                .fail(function (e) {
                    console.log("error" + e);
                    cb(null,JSON.parse(e.responseText));
                })

        },

		logout: function (cb) {
            
			var u = getCurrentUser();
			if (u == null) {
				
				cb({"data":"ok", "message" : "User already logged out"}, null);
				return;
			}

            var url = BaasBox.endPoint + '/logout'
			
			var req = $.ajax({
                url: url,
                method: 'POST',
                success: function (res) {
					$.cookie(COOKIE_KEY, null);
                    setCurrentUser(null);
                    cb({"data":"ok", "message" : "User logged out"}, null)
                },
                error: function (e) {
                    cb(null,JSON.parse(e.responseText))
                }
            });
        },

        createUser: function (user, pass, cb) {

            var url = BaasBox.endPoint + '/user'

            var req = $.ajax({
                url: url,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    username: user,
                    password: pass
                }),
                success: function (res) {
					
					var roles = [];

                    $(res.data.user.roles).each(function(idx,r){
                        roles.push(r.name);
                    })
					
                    setCurrentUser({"username" : res.data.user.name, 
									"token" : res.data['X-BB-SESSION'], 
									"roles": roles});
									
                    var u = getCurrentUser()
                    cb(u,null);
                },
                error: function (e) {
                    cb(null,JSON.parse(e.responseText))
                }
            });

        },

        getCurrentUser: function(){
            return getCurrentUser();
        },

        loadCollectionWithParams: function (collection, params, callback) {

            console.log("loading collection " + collection);

            var url = BaasBox.endPoint + '/document/' + collection
            var req = $.ajax({
                url: url,
                method: 'GET',
                timeout: 20000,
                contentType: 'application/json',
                dataType: 'json',
                data: params,
                success: function (res) {
                    callback(res['data'], null);
                },
                error: function (e) {
                    if (e.status == 0) { // TODO: is this the best way?
                        e.responseText = "{'result':'error','message':'Server is probably down'}"; 
                    }
                    callback(null, e); 
                }
            });

        },

        loadCollection: function (collection, callback) {

            BaasBox.loadCollectionWithParams(collection, {
                page: 0,
                recordsPerPage: BaasBox.pagelength
            }, callback)

        },

        // only for json assets
        loadAssetData: function (asset, callback) {

            var url = BaasBox.endPoint + '/asset/' + asset + '/data'
            var req = $.ajax({
                url: url,
                method: 'GET',
                contentType: 'application/json',
                dataType: 'json',
                success: function (res) {
                    callback(res['data'], null);
                },
                error: function (e) {
                    callback(null, JSON.parse(e.responseText));
                }
            });

        },

		isEmpty: function (ob){
		      for(var i in ob){ return false;}
		      return true;
		}, 

        getImageURI: function (name, params, callback) {

            var uri = BaasBox.endPoint + '/asset/' + name;
            var r;
            
			if (params == null || this.isEmpty(params)) {
				callback({"data" : uri+ "?X-BAASBOX-APPCODE="+BaasBox.appcode}, null);
				return;
			}

            for(var prop in params){
                var a = [];
                a.push(prop);
                a.push(params[prop]);
                r = a.join('/');
            }
            
            uri = uri.concat('/');
            uri = uri.concat(r);
            
            p = {};
            p['X-BAASBOX-APPCODE'] = BaasBox.appcode;
            var req = $.get(uri, p)
                .done(function (res) {
                    console.log("URI is " , this.url);
                    callback({"data" : this.url}, null);
                })
                .fail(function (e) {
                    console.log("error in URI " , e);
                    callback(null, JSON.parse(e.responseText));
                })

        },

		save: function(object, collection, callback) {
						
			var method = 'POST';
			var url = BaasBox.endPoint + '/document/' + collection
			
			if (object.id) {
				method = 'PUT';
				url = BaasBox.endPoint + '/document/' + collection + '/' + object.id;
			}
			
			json = JSON.stringify(object);
			
	        var req = $.ajax({
                url: url,
                type: method,
                contentType: 'application/json',
                dataType: 'json',
                data: json,
                success: function (res) {
                    callback(res['data'], null);
                },
                error: function (e) {
                    callback(null, JSON.parse(e.responseText));
                }
            });
			
		},
		
		updateField: function (objectId, collection, field, newValue, callback) {
			
			url = BaasBox.endPoint + '/document/' + collection + '/' + objectId + '/.' + field;
			var json = JSON.stringify({"data" : newValue})
			
	        var req = $.ajax({
                url: url,
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
                data: json,
                success: function (res) {
                    callback(res['data'], null);
                },
                error: function (e) {
                    callback(null, e.responseText);
                }
            });
			
		},
		
		delete: function (objectId, collection, callback) {
			
			url = BaasBox.endPoint + '/document/' + collection + '/' + objectId;
			
	        var req = $.ajax({
                url: url,
                method: 'DELETE',
                success: function (res) {
                    callback(res['data'], null);
                },
                error: function (e) {
                    callback(null, JSON.parse(e.responseText));
                }
            });
			
		}


    };

})();