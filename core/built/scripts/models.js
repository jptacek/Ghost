/*global window, document, setTimeout, Ghost, $, _, Backbone, JST, shortcut, NProgress */

(function () {
    "use strict";
    NProgress.configure({ showSpinner: false });

    Ghost.TemplateModel = Backbone.Model.extend({

        // Adds in a call to start a loading bar
        // This is sets up a success function which completes the loading bar
        fetch : function (options) {
            options = options || {};

            NProgress.start();

            options.success = function () {
                NProgress.done();
            };

            return Backbone.Collection.prototype.fetch.call(this, options);
        }
    });
}());
/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';

    Ghost.Models.Post = Ghost.TemplateModel.extend({

        defaults: {
            status: 'draft'
        },

        blacklist: ['published', 'draft'],

        parse: function (resp) {
            if (resp.status) {
                resp.published = !!(resp.status === 'published');
                resp.draft = !!(resp.status === 'draft');
            }
            if (resp.tags) {
                // TODO: parse tags into it's own collection on the model (this.tags)
                return resp;
            }
            return resp;
        },

        validate: function (attrs) {
            if (_.isEmpty(attrs.title)) {
                return 'You must specify a title for the post.';
            }
        },

        addTag: function (tagToAdd) {
            var tags = this.get('tags') || [];
            tags.push(tagToAdd);
            this.set('tags', tags);
        },

        removeTag: function (tagToRemove) {
            var tags = this.get('tags') || [];
            tags = _.reject(tags, function (tag) {
                return tag.id === tagToRemove.id || tag.name === tagToRemove.name;
            });
            this.set('tags', tags);
        }
    });

    Ghost.Collections.Posts = Backbone.Collection.extend({
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        nextPage: 0,
        prevPage: 0,

        url: Ghost.settings.apiRoot + '/posts/',
        model: Ghost.Models.Post,

        parse: function (resp) {
            if (_.isArray(resp.posts)) {
                this.limit = resp.limit;
                this.currentPage = resp.page;
                this.totalPages = resp.pages;
                this.totalPosts = resp.total;
                this.nextPage = resp.next;
                this.prevPage = resp.prev;
                return resp.posts;
            }
            return resp;
        }
    });

}());

/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';
    //id:0 is used to issue PUT requests
    Ghost.Models.Settings = Ghost.TemplateModel.extend({
        url: Ghost.settings.apiRoot + '/settings/?type=blog,theme',
        id: '0'
    });

}());
/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';

    Ghost.Collections.Tags = Ghost.TemplateModel.extend({
        url: Ghost.settings.apiRoot + '/tags/'
    });
}());

/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';

    Ghost.Models.Themes = Ghost.TemplateModel.extend({
        url: Ghost.settings.apiRoot + '/themes'
    });

}());
/*global Ghost, Backbone, $ */
(function () {
    'use strict';
    Ghost.Models.uploadModal = Ghost.TemplateModel.extend({

        options: {
            close: true,
            type: 'action',
            style: ["wide"],
            animation: 'fade',
            afterRender: function (id) {
                var filestorage = $('#' + this.options.model.id).data('filestorage');
                this.$('.js-drop-zone').upload({fileStorage: filestorage});
            },
            confirm: {
                reject: {
                    func: function () { // The function called on rejection
                        return true;
                    },
                    buttonClass: true,
                    text: "Cancel" // The reject button text
                }
            }
        },
        content: {
            template: 'uploadImage'
        },

        initialize: function (options) {
            this.options.id = options.id;
            this.options.key = options.key;
            this.options.src = options.src;
            this.options.confirm.accept = options.accept;
        }
    });

}());
/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';

    Ghost.Models.User = Ghost.TemplateModel.extend({
        url: Ghost.settings.apiRoot + '/users/me/'
    });

//    Ghost.Collections.Users = Backbone.Collection.extend({
//        url: Ghost.settings.apiRoot + '/users/'
//    });

}());

/*global window, document, Ghost, $, _, Backbone */
(function () {
    'use strict';

    Ghost.Models.Widget = Ghost.TemplateModel.extend({

        defaults: {
            title: '',
            name: '',
            author: '',
            applicationID: '',
            size: '',
            content: {
                template: '',
                data: {
                    number: {
                        count: 0,
                        sub: {
                            value: 0,
                            dir: '', // "up" or "down"
                            item: '',
                            period: ''
                        }
                    }
                }
            },
            settings: {
                settingsPane: false,
                enabled: false,
                options: [{
                    title: 'ERROR',
                    value: 'Widget options not set'
                }]
            }
        }
    });

    Ghost.Collections.Widgets = Backbone.Collection.extend({
        // url: Ghost.settings.apiRoot + '/widgets/', // What will this be?
        model: Ghost.Models.Widget
    });

}());