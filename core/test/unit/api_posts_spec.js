/*globals describe, before, beforeEach, afterEach, it */
var testUtils = require('./utils'),
    should = require('should'),
    _ = require('underscore'),
    request = require('request'),
    expectedPostsProperties = ['posts', 'page', 'limit', 'pages', 'total'],
    expectedPostProperties = ['id', 'uuid', 'title', 'slug', 'markdown', 'html', 'meta_title', 'meta_description',
        'featured', 'image', 'status', 'language', 'author_id', 'created_at', 'created_by', 'updated_at', 'updated_by',
        'published_at', 'published_by', 'page', 'author', 'user', 'tags'];



request = request.defaults({jar:true})

describe('Post API', function () {

    var user = testUtils.DataGenerator.forModel.users[0],
        csrfToken = '';

    before(function (done) {
        testUtils.clearData()
            .then(function () {
                done();
            }, done);
    });

    beforeEach(function (done) {
        this.timeout(5000);
        testUtils.initData()
            .then(function () {
                testUtils.insertDefaultFixtures();
            })
            .then(function () {
                // do a get request to get the CSRF token first
                request.get(testUtils.API.getSigninURL(), function (error, response, body) {
                    var pattern_meta = /<meta.*?name="csrf-param".*?content="(.*?)".*?>/i;
                    pattern_meta.should.exist;
                    csrfToken = body.match(pattern_meta)[1];
                    request.post({uri:testUtils.API.getSigninURL(),
                            headers: {'X-CSRF-Token': csrfToken}}, function (error, response, body) {
                        done();
                    }).form({email: user.email, password: user.password});
                });
            }, done);
    });

    afterEach(function (done) {
        testUtils.clearData().then(function () {
            done();
        }, done);
    });

    it('can retrieve all posts', function (done) {
        request.get(testUtils.API.getApiURL('posts/'), function (error, response, body) {
            response.should.have.status(200);
            response.should.be.json;
            var jsonResponse = JSON.parse(body);
            jsonResponse.posts.should.exist;
            testUtils.API.checkResponse (jsonResponse, expectedPostsProperties);
            jsonResponse.posts.should.have.length(5);
            testUtils.API.checkResponse (jsonResponse.posts[0], expectedPostProperties);
            done();
        });
    });

    it('can retrieve a post', function (done) {
        request.get(testUtils.API.getApiURL('posts/1/'), function (error, response, body) {
            response.should.have.status(200);
            response.should.be.json;
            var jsonResponse = JSON.parse(body);
            jsonResponse.should.exist;
            testUtils.API.checkResponse (jsonResponse, expectedPostProperties);
            done();
        });
    });

    it('can create a new draft, publish post, update post', function (done) {
        var newTitle = 'My Post',
            changedTitle = 'My Post changed',
            publishedState = 'published',
            newPost = {status:'draft', title:newTitle, markdown:'my post'};

        request.post({uri: testUtils.API.getApiURL('posts/'),
                headers: {'X-CSRF-Token': csrfToken},
                json: newPost}, function (error, response, draftPost) {
            response.should.have.status(200);
            response.should.be.json;
            draftPost.should.exist;
            draftPost.title.should.eql(newTitle);
            draftPost.status = publishedState;
            testUtils.API.checkResponse (draftPost, expectedPostProperties);
            request.put({uri: testUtils.API.getApiURL('posts/' + draftPost.id + '/'),
                    headers: {'X-CSRF-Token': csrfToken},
                    json: draftPost}, function (error, response, publishedPost) {
                response.should.have.status(200);
                response.should.be.json;
                publishedPost.should.exist;
                publishedPost.title.should.eql(newTitle);
                publishedPost.status.should.eql(publishedState);
                testUtils.API.checkResponse (publishedPost, expectedPostProperties);
                request.put({uri: testUtils.API.getApiURL('posts/' + publishedPost.id + '/'),
                        headers: {'X-CSRF-Token': csrfToken},
                        json: publishedPost}, function (error, response, updatedPost) {
                    response.should.have.status(200);
                    response.should.be.json;
                    updatedPost.should.exist;
                    updatedPost.title.should.eql(newTitle);
                    testUtils.API.checkResponse (updatedPost, expectedPostProperties);
                    done();
                });
            });
        });
    });

    it('can delete a post', function (done) {
        var deletePostId = 1;
        request.del({uri: testUtils.API.getApiURL('posts/' + deletePostId +'/'),
                headers: {'X-CSRF-Token': csrfToken}}, function (error, response, body) {
            response.should.have.status(200);
            response.should.be.json;
            var jsonResponse = JSON.parse(body);
            jsonResponse.should.exist;
            testUtils.API.checkResponse (jsonResponse, ['id', 'slug']);
            jsonResponse.id.should.eql(deletePostId);
            done();
        });
    });

    it('can\'t delete a non existent post', function (done) {
        request.del({uri: testUtils.API.getApiURL('posts/99/'),
                headers: {'X-CSRF-Token': csrfToken}}, function (error, response, body) {
            response.should.have.status(404);
            response.should.be.json;
            var jsonResponse = JSON.parse(body);
            jsonResponse.should.exist;
            testUtils.API.checkResponse (jsonResponse, ['error']);
            done();
        });
    });

    it('can delete a new draft', function (done) {
        var newTitle = 'My Post',
            publishedState = 'draft',
            newPost = {status: publishedState, title: newTitle, markdown: 'my post'};

        request.post({uri: testUtils.API.getApiURL('posts/'),
                headers: {'X-CSRF-Token': csrfToken},
                json: newPost}, function (error, response, draftPost) {
            response.should.have.status(200);
            response.should.be.json;
            draftPost.should.exist;
            draftPost.title.should.eql(newTitle);
            draftPost.status = publishedState;
            testUtils.API.checkResponse (draftPost, expectedPostProperties);
            request.del({uri: testUtils.API.getApiURL('posts/' + draftPost.id + '/'),
                    headers: {'X-CSRF-Token': csrfToken}}, function (error, response, body) {
                response.should.have.status(200);
                response.should.be.json;
                var jsonResponse = JSON.parse(body);
                jsonResponse.should.exist;
                testUtils.API.checkResponse (jsonResponse, ['id', 'slug']);
                done();
            });
        });
    });

    
    it('can\'t retrieve non existent post', function (done) {
        request.get(testUtils.API.getApiURL('posts/99/'), function (error, response, body) {
            response.should.have.status(404);
            response.should.be.json;
            var jsonResponse = JSON.parse(body);
                jsonResponse.should.exist;
            testUtils.API.checkResponse (jsonResponse, ['error']);
            done();
        });
    });

    it('can edit a post', function (done) {
        request.get(testUtils.API.getApiURL('posts/1/'), function (error, response, body) {
            var jsonResponse = JSON.parse(body),
                changedValue = 'My new Title';
            jsonResponse.should.exist;
            //jsonResponse.websiteshould.be.empty;
            jsonResponse.title = changedValue;

            request.put({uri: testUtils.API.getApiURL('posts/1/'),
                    headers: {'X-CSRF-Token': csrfToken},
                    json: jsonResponse}, function (error, response, putBody) {
                response.should.have.status(200);
                response.should.be.json;
                putBody.should.exist;
                putBody.title.should.eql(changedValue);
                
                testUtils.API.checkResponse (putBody, expectedPostProperties);
                done();
            });
        });
    });

    it('can\'t edit non existent post', function (done) {
        request.get(testUtils.API.getApiURL('posts/1/'), function (error, response, body) {
            var jsonResponse = JSON.parse(body),
                changedValue = 'My new Title';
            jsonResponse.title.exist;
            jsonResponse.testvalue = changedValue;
            jsonResponse.id = 99;
            request.put({uri: testUtils.API.getApiURL('posts/99/'),
                    headers: {'X-CSRF-Token': csrfToken},
                    json: jsonResponse}, function (error, response, putBody) {
                response.should.have.status(404);
                response.should.be.json;
                testUtils.API.checkResponse (putBody, ['error']);
                done();
            });
        });
    });

});
