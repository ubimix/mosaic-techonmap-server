define(['Backbone','./../models/Resource'], function (Backbone, Resource) {

	var ResourceCollection = Backbone.Collection.extend({
		model: Resource,

		url: '/api/resources'
	});

	return ResourceCollection;
});