define([ 'Backbone', 'text!./pagination.html' ], function(Backbone, template) {

    var PaginationView = Backbone.View.extend({

        events : {
            'click a.first' : 'gotoFirst',
            'click a.prev' : 'gotoPrev',
            'click a.next' : 'gotoNext',
            'click a.last' : 'gotoLast',
            'click a.page' : 'gotoPage',
            'click .howmany a' : 'changeCount',
            'click a.sort' : 'sort',
            'click a.togglesort' : 'toggleSort',
            'click a.filter' : 'filter'
        },

        tagName : 'aside',

        pagingTemplate : _.template(template),

        initialize : function() {
            this.collection.on('reset', this.render, this);
            // this.$el.appendTo('#pagination');

        },
        render : function() {
            var html = this.pagingTemplate(this.collection.info());
            this.$el.html(html);
            return this;
        },

        gotoFirst : function(e) {
            this.boxEvent(e);
            this.collection.goTo(1);
        },

        gotoPrev : function(e) {
            this.boxEvent(e);
            this.collection.previousPage();
        },

        gotoNext : function(e) {
            this.boxEvent(e);
            this.collection.nextPage();

        },

        gotoLast : function(e) {
            this.boxEvent(e);
            this.collection.goTo(this.collection.information.lastPage);
        },

        gotoPage : function(e) {
            this.boxEvent(e);
            var page = $(e.target).text();
            this.collection.goTo(page);
        },

        changeCount : function(e) {
            this.boxEvent(e);
            var per = $(e.target).text();
            this.collection.howManyPer(per);
        },

        boxEvent : function(e) {
            e.preventDefault();
            e.stopPropagation();
        },

        sort : function(e) {
            this.boxEvent(e);
            var sort = $(e.target).data('sort');
            var sortOrder = $(e.target).data('sort-order');
            sortOrder = sortOrder || 'asc';
            console.log('sortOrder:', sortOrder);
            this.collection.setSort(sort, sortOrder);
        },

        getFilterField : function() {
            return $('#filterByOption').val();
        },

        getFilterValue : function() {
            return $('#filterString').val();
        },

        preserveFilterField : function(field) {
            $('#filterByOption').val(field);
        },

        preserveFilterValue : function(value) {
            $('#filterString').val(value);
        },

        filter : function(e) {
            this.boxEvent(e);

            var fields = this.getFilterField();
            /*
             * Note that this is an example! You can create an array like
             * 
             * fields = ['Name', 'Description', ...];
             * 
             * Or an object with rules like
             * 
             * fields = { 'Name': {cmp_method: 'levenshtein', max_distance: 7},
             * 'Description': {cmp_method: 'regexp'}, 'Rating': {} // This will
             * default to 'regexp' };
             */

            var filter = this.getFilterValue();

            this.collection.setFilter(fields, filter);
            this.collection.pager();

            this.preserveFilterField(fields);
            this.preserveFilterValue(filter);
        }
    });

    return PaginationView;
});