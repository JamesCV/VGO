var HTTPClient = require('..');

exports.testIsConstructor = function (test) {
    test.equal(typeof HTTPClient, 'function');

    test.done();
};

exports.testInstanceProperties = function (test) {
    var client = new HTTPClient();

    test.equal(typeof client.open, 'function');

    test.done();
};

exports.testGetRequest = function (test) {
    var client = new HTTPClient();

    test.expect(4);

    client.open('http://google.com', function (err, page) {
        page = page.toString();
        test.ifError(err);
        test.equal(typeof page, 'string');
        test.ok(page.length > 0);
        test.ok(~page.indexOf('HTML'));
        test.done();
    });
};

exports.testPostRequest = function (test) {
    var client = new HTTPClient(),
        data = {
             "client" : "t"
           , "text" : "The quick brown fox jumps over the lazy dog"
           , "hl" : "en"
           , "sl" : "auto"
           , "tl" : "ru"
           , "multires" : "1"
           , "otf" : "1"
           , "pc" : "1"
           , "ssel" : "0"
           , "tsel" : "6"
           , "uptl" : "ru"
           , "alttl" : "en"
           , "sc" : "1"
        };

    test.expect(4);

    client.open({ url: 'https://translate.google.com/', data: data }, function (err, page) {
        page = page.toString();
        test.ifError(err);
        test.equal(typeof page, 'string');
        test.ok(page.length > 0);
        test.ok(~page.indexOf('The quick brown fox jumps over the lazy dog'));
        test.done();
    });
};

exports.testEmptyPostRequest = function (test) {
    var client = new HTTPClient();

    test.expect(3);

    client.open({ url: 'https://translate.google.com/' }, function (err, page) {
        page = page.toString();
        test.ifError(err);
        test.equal(typeof page, 'string');
        test.ok(page.length > 0);
        test.done();
    });
};
