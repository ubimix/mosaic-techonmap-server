define([ '../../commons/UmxView', 'Backbone', 'text!./paginator.html' ],

function(UmxView, Backbone, PaginationViewTemplate) {

    var PaginationView = UmxView.extend({
        template : _.template(PaginationViewTemplate),

        initialize : function() {
            this.collection.on('reset', this.render, this);
            var self = this;
            Backbone.pubSub.on('sort', function(action) {
                self.collection.setSort(action.sort, action.sortOrder);
            }, this);
            Backbone.pubSub.on('pagecount', function(pageCount) {
                self.collection.howManyPer(pageCount);
            }, this);
        },

        renderPaginator : function(elm) {
            this.refContainer = elm;
            var list = this.getPageSet();
            var len = list ? list.length : 0;
            if (len > 1)
                elm.show();
            else
                elm.hide();
        },

        renderedPaginator : function(elm) {
            var list = this.getPageSet();
            var currentPageIdx = this.getCurrentPageIdx();
            this._renderReference(this.firstPageTemplate, currentPageIdx - 1);
            _.each(list, function(page, index) {
                var el = this._renderReference(this.innerPageTemplate, index,
                        '' + (index + 1));
                if (index == currentPageIdx) {
                    el.addClass('active');
                }
            }, this);
            this._renderReference(this.lastPageTemplate, currentPageIdx + 1);
        },

        renderFirstPageRef : function(elm) {
            this.firstPageTemplate = elm;
            elm.remove();
        },

        renderLastPageRef : function(elm) {
            this.lastPageTemplate = elm;
            elm.remove();
        },

        renderInnerPageRef : function(elm) {
            this.innerPageTemplate = elm;
            elm.remove();
        },

        _renderReference : function(template, index, label) {
            if (!template)
                return;
            var that = this;
            var el = template.clone();
            this.renderElement(el);
            this.refContainer.append(el);
            var ref = el.find('a');
            ref.attr('href', '#' + index)
            var list = this.getPageSet();
            ref.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (index >= 0 && index < list.length) {
                    that.collection.goTo(index + 1);
                }
            })
            if (index < 0 || index >= list.length) {
                el.addClass('disabled');
            }

            if (label) {
                ref.text(label);
            }
            return el;
        },

        getCurrentPageIdx : function() {
            var currentPageIdx = this.collection.currentPage - 1;
            return currentPageIdx;
        },

        getPageSet : function() {
            var info = this.collection.info();
            return info.pageSet
        }

    });

    return PaginationView;
});