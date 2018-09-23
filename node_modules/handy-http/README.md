NodeJS handy http[s] client
============

Handy-http module provides simple and flexible interface for NodeJS native <a htref="http://nodejs.org/api/http.html#http_http_request_options_callback">http.request<a>.

Description
============

This class is very lightweight and handful if you need to make various types of http requests with just a few lines of code.
In my projects it lets me to avoid copy-pasting and makes my code more readable and maintainable.
Class provides 'open' method that takes a connection object as the first param and a callback function as the second one.
It returns the request object that can be listened to all kinds of events from original NodeJS <a href="http://nodejs.org/api/http.html#http_class_http_clientrequest">http.ClientRequest</a>.
Main features:
- accepts various types of data to send from plain javascript objects to NodeJS Buffer and ReadableStream.
- is able to send multiple files with 'multipart/form-data' Content-Type header
- returns parsed JSON object if server respond with properly Content-Type header
- supports proxy requests
- provides ability to extend request headers
- supports https protocol

Example
------------
```javascript
var HTTPClient = require('handy-http'),
    client = new HTTPCLient(),
    onResponse = function (err, res) {
        console.log(err || res);
    };

/**
 * The simplest case is the 'GET' request'.
 */
client.open('http://_url_', onResponse);

// It is shortcut for
client.open({ url: 'http://_url_' }, onResponse);

/**
 * You can combine url params in querystring with a hash of additional params
 * It's not nessesary urlencode your params first, it will be done for you.
 */
client.open({
    url: 'http://_url_?one=1&two=2',
    data: { three: 3, more: '4 and 5' }
}, onResponse);
// Resulting URL will look like http://_url_?one=1&two=2&three=3&more=4%20and%205'

/**
 * Your should note 'POST' or any connection method if you want that type of request.
 */
client.open({
    url: 'http://_url_',
    method: 'POST',
    data: { param1: 'value1', param2: 'value2' }
}, onResponse);

/**
 * You can send a file or any binary data within request using NodeJS Buffer as data value.
 * You can also use NodeJS <a href="http://nodejs.org/api/stream.html">Stream-like</a> object, for example <a href="http://nodejs.org/api/fs.html#fs_class_fs_readstream">fs.ReadStream</a>
 * Stream will be sent by chunks with 'Transfer-Encoding: chunked' HTTP-header
 */
var fileStream = fs.createReadStream('_path_to_file_'),
    fileBuffer = fs.readFileSync('_path_to_file_');

client.open({
    url: 'http://_url_',
    method: 'POST',
    data: fileBuffer,
    // data: fileStream // wil be sended with 'Transfer-Encoding: chunked' HTTP-header,
    headers: {
        'content-type': 'application/octet-stream'
    }
}, onResponse);

/**
 * You can send some files and additional data with 'multipart/form-data' Content-Type header.
 */
client.open({
    url: 'http://_url_',
    method: 'POST',
    data: { param1: 'value1', param2: 'value2' },
    files: [
        { fieldname: 'fileField1', name: 'test.png', type: 'image/png', value: file1Buffer },
        { fieldname: 'fileField2', name: 'test.jpg', type: 'image/jpeg', value: file2Buffer }
    ],
    headers {
        'content-type': 'multipart/form-data'
    }
}, onResponse);

/**
 * You can proxy your request.
 */
client.open({
    url: 'http://_url_',
    method: 'POST',
    data: { param1: 'value1', param2: 'value2' },
    proxy: {
        host: '_proxy_host_',
        port: '_proxy_port_'
    }
}, onResponse);

/**
 * If you need a lower level of manipulation you can still listen to all events provided by native NodeJS <a href="http://nodejs.org/api/http.html#http_class_http_clientrequest">http.ClientRequest</a>.
 */
var request = client.open(...);

request.on('socket', function (socket) {
    ...
});

// You can close connection if you need it.
request.close();

```
