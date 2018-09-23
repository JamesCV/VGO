var http = require('http'),
    https = require('https'),
    stream = require('stream'),
    url = require('url'),
    querystring = require('querystring'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

/**
 * Simple http client.
 * @class
 * @name HTTPClient
 * @param {Object|Boolean} [agent] Controls Agent behavior. When an Agent is used request will default to Connection: keep-alive.
 */
var HTTPClient = module.exports = function (agent) {
    this._httpAgent = agent;
};

/**
 * Open connection with server.
 * @function
 * @name HTTPClient.open
 * @param {String|Object} connection uniform resource locator string or connection params object.
 * if String: Alias for GET request, equivalent for the { url : connection }
 * if Object: {Object} [connection.headers] Request headers addition.
 *            {Object} [conection.proxy] Remote proxy host and port.
 *            {Object[]} [conection.files] List of files.
 *            {String|Object|Buffer|Stream.Readable} [connection.data] In case of:
 *                - String or Buffer is sent as it is with installing properly Content-Length header
 *                - Stream.Readable is sent in chunks with Transfer-Encoding "chunked" header.
 *                - Object becomes a string according to querystring.stringify
 *                @see http://nodejs.org/api/querystring.html#querystring_querystring_stringify_obj_sep_eq
 *                if no connection.files or Content-Type header any but multipart/form-data.
 * @param {Function} callback Called with null or error description and server answer.
 * @returns {HTTPRequest} Useful for events listening.
 */
HTTPClient.prototype.open = function (connection, callback) {
    var options = url.parse(connection.url || connection),
        data = connection.data,
        isBuffer = Buffer.isBuffer(data),
        isReadableStream = data instanceof stream.Readable,
        method = (connection.method || 'GET').toUpperCase(),
        headers = Object.keys(connection.headers || {}).reduce(function (headers, header) {
            headers[header.toLowerCase()] = connection.headers[header];
            return headers;
        }, {}),
        files = connection.files || [],
        proxy = connection.proxy;

    if(files.length) {
        headers['content-type'] = 'multipart/form-data';
    }

    switch(headers['content-type'] || typeof data) {
        case 'multipart/form-data':
            var boundary = Date.now().toString(16),
                prefix = 'Content-Disposition: form-data;',
                segments = [];

            headers['content-type'] += '; boundary=' + boundary;

            for(var key in data) {
                segments.push(
                    util.format('%s name="%s"\r\n\r\n%s\r\n', prefix, key, data[key])
                );
            }

            files.forEach(function (file) {
                segments.push(
                    util.format('%s name="%s"; filename="%s"\r\nContent-Type: %s\r\n\r\n%s\r\n', prefix, file.fieldname || file.name, file.name, file.type, file.value)
                );
            });

            data = util.format('--%s\r\n%s--%s--\r\n', boundary, segments.join('--' + boundary + '\r\n'), boundary);
            break;
        case 'application/x-www-form-urlencoded':
        case 'object':
            if(isBuffer) {
                headers['content-length'] = data.length;
                break;
            }
            else if(isReadableStream) {
                headers['transfer-encoding'] = 'chunked';
                break;
            }
            else {
                headers['content-type'] = 'application/x-www-form-urlencoded';
                data = querystring.stringify(data);

                if('GET' === method) {
                    options.pathname = options.path = url.format({
                        pathname: options.pathname,
                        search: [options.search, data].filter(Boolean).join('&')
                    });
                    break;
                }
            }
        case 'string':
            headers['content-length'] = Buffer.byteLength(data);
            break;
        default:
            data = '';
    }

    if(proxy) {
        options.pathname =
            options.path = options.protocol + '//' + options.hostname + options.pathname;
        options.hostname =
            options.host = proxy.host;
        options.port = proxy.port;
    }

    options.headers = headers;
    options.method = method;
    options.agent = this._httpAgent;

    var contentType,
        size = 0,
        result = [],
        onData = function (chunk) {
            size += chunk.length;
            result.push(chunk);
        },
        request = new HTTPRequest(options)
            .once('request', function (request) {
                if(isReadableStream) {
                    data.pipe(request);
                }
                else {
                    'GET' === method || request.write(data);
                    request.end();
                }
            })
            .once('response', function (response) {
                contentType = response.headers['content-type'];
            })
            .on('data', onData)
            .once('end', function () {
                request.removeListener('data', onData);
                result = Buffer.concat(result, size);

                if(contentType && ~contentType.search(/json/i)) {
                    try {
                        result = JSON.parse(result);
                    }
                    catch(err) {
                        return callback(err.toString());
                    }
                }
                callback(null, result);
            })
            .once('error', function (err) {
                callback(err.toString());
            })
            .open();

    return request;
};

/**
 * Wrapper above native NodeJS http.ClientRequest.
 * @class
 * @name HTTPRequest
 * @param {Object} options Request params.
 * @augments events.EventEmitter
 * @borrows http.ClientRequest#event:response as this.event:response
 * @borrows http.ClientRequest#event:data as this.event:data
 * @borrows http.ClientRequest#event:end as this.event:end
 * @borrows http.ClientRequest#event:error as this.event:error
 */
var HTTPRequest = function (options) {
    EventEmitter.call(this);

    this._options = options;
};
/**
 * @augments events.EventEmitter
 */
util.inherits(HTTPRequest, EventEmitter);

/**
 * Open connection with server.
 * @function
 * @name HTTPRequest.open
 * @returns {HTTPRequest} Useful for events listening.
 */
HTTPRequest.prototype.open = function () {
    var self = this,
        onData = function (chunk) {
            /**
             * @name HTTPRequest#data
             * @event
             * @param {String|Buffer} chunk
             */
            self.emit('data', chunk);
        };

    this._request = ~this._options.protocol.indexOf('https')?
        https.request(this._options) : http.request(this._options);

    /**
     * @name HTTPRequest#request
     * @event
     * @param {http.ClientRequest} request
     */
    this.emit('request', this._request);

    this._request
        /**
         * @name HTTPRequest#socket
         * @event
         * @param {net.Socket} socket
         */
        .once('socket', function (socket) {
            self.emit('socket', socket);
        })
        .once('response', function (response) {
            /**
             * @name HTTPRequest#response
             * @event
             * @param {http.ClientResponse} response
             */
            self.emit('response', response);
            response
                .on('data', onData)
                .once('end', function () {
                    response.removeListener('data', onData);
                    /**
                     * @name HTTPRequest#end
                     * @event
                     */
                    self.emit('end');
                });
        })
        .once('error', function (err) {
            /**
             * @name HTTPRequest#error
             * @event
             * @param {Object} err
             */
            self.emit('error', err);
        });

    return this;
};

/**
 * Close connection with server.
 * @function
 * @name HTTPRequest.close
 * @returns {HTTPRequest}
 */
HTTPRequest.prototype.close = function () {
    this._request.abort();
    this.emit('abort');

    return this;
};
