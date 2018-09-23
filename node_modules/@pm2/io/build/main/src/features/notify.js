"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const semver = require("semver");
const json_1 = require("../utils/json");
const configuration_1 = require("../configuration");
const transport_1 = require("../utils/transport");
const debug_1 = require("debug");
const debug = debug_1.default('axm:notify');
class NotifyOptions {
}
exports.NotifyOptions = NotifyOptions;
exports.NotifyOptionsDefault = {
    level: 'info',
    catchExceptions: true
};
class NotifyFeature {
    constructor() {
        this.options = exports.NotifyOptionsDefault;
        this.levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
    }
    init(options) {
        if (options) {
            this.options = options;
        }
        if (this.options && this.options.catchExceptions) {
            if (process.env.CATCH_CONTEXT_ON_ERROR === 'true' && (semver.satisfies(process.version, '< 8.0.0') ||
                (semver.satisfies(process.version, '< 10.0.0') && !process.env.FORCE_INSPECTOR))) {
                debug(`Inspector is not available on node version ${process.version} !`);
            }
            if (process.env.CATCH_CONTEXT_ON_ERROR === 'true' && semver.satisfies(process.version, '>= 10.0.0') ||
                (semver.satisfies(process.version, '>= 8.0.0') && process.env.FORCE_INSPECTOR)) {
                const NotifyInspector = require('./notifyInspector').default;
                NotifyInspector.catchAllDebugger();
            }
            else {
                this.catchAll();
            }
        }
        return {
            notifyError: this.notifyError
        };
    }
    notifyError(err, level) {
        if (!(err instanceof Error)) {
            console.trace('[PM2-IO-APM] You should use notify with an Error object');
            return -1;
        }
        if (!level || this.levels.indexOf(level) === -1) {
            return transport_1.default.send({
                type: 'process:exception',
                data: json_1.default.jsonize(err)
            });
        }
        if (this.levels.indexOf(this.options.level) >= this.levels.indexOf(level)) {
            return transport_1.default.send({
                type: 'process:exception',
                data: json_1.default.jsonize(err)
            });
        }
        return null;
    }
    catchAll(opts) {
        if (opts === undefined) {
            opts = { errors: true };
        }
        configuration_1.default.configureModule({
            error: opts.errors
        });
        if (process.env.exec_mode === 'cluster_mode') {
            return false;
        }
        const self = this;
        function getUncaughtExceptionListener(listener) {
            return function uncaughtListener(err) {
                let error = err && err.stack ? err.stack : err;
                if (err && err.length) {
                    err._length = err.length;
                    delete err.length;
                }
                if (listener === 'unhandledRejection') {
                    console.log('You have triggered an unhandledRejection, you may have forgotten to catch a Promise rejection:');
                }
                console.error(error);
                let errObj;
                if (err) {
                    errObj = self._interpretError(err);
                }
                transport_1.default.send({
                    type: 'process:exception',
                    data: errObj !== undefined ? errObj : { message: 'No error but ' + listener + ' was caught!' }
                });
                if (!process.listeners(listener).filter(function (listener) {
                    return listener !== uncaughtListener;
                }).length) {
                    if (listener === 'uncaughtException') {
                        process.exit(1);
                    }
                }
            };
        }
        if (opts.errors === true && util.inspect(process.listeners('uncaughtException')).length === 2) {
            process.once('uncaughtException', getUncaughtExceptionListener('uncaughtException'));
            process.once('unhandledRejection', getUncaughtExceptionListener('unhandledRejection'));
        }
        else if (opts.errors === false
            && util.inspect(process.listeners('uncaughtException')).length !== 2) {
            process.removeAllListeners('uncaughtException');
            process.removeAllListeners('unhandledRejection');
        }
    }
    expressErrorHandler() {
        configuration_1.default.configureModule({
            error: true
        });
        return function errorHandler(err, req, res, next) {
            if (res.statusCode < 400)
                res.statusCode = 500;
            err.url = req.url;
            err.component = req.url;
            err.action = req.method;
            err.params = req.body;
            err.session = req.session;
            transport_1.default.send({
                type: 'process:exception',
                data: json_1.default.jsonize(err)
            });
            return next(err);
        };
    }
    _interpretError(err) {
        let sErr = {
            message: null,
            stack: null
        };
        if (err instanceof Error) {
            // Error object type processing
            sErr = err;
        }
        else {
            // JSON processing
            sErr.message = err;
            sErr.stack = err;
        }
        return json_1.default.jsonize(sErr);
    }
}
exports.NotifyFeature = NotifyFeature;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL25vdGlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE0QjtBQUc1QixpQ0FBZ0M7QUFDaEMsd0NBQXFDO0FBQ3JDLG9EQUE0QztBQUM1QyxrREFBMEM7QUFFMUMsaUNBQXlCO0FBQ3pCLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUVqQztDQUdDO0FBSEQsc0NBR0M7QUFFWSxRQUFBLG9CQUFvQixHQUFHO0lBQ2xDLEtBQUssRUFBRSxNQUFNO0lBQ2IsZUFBZSxFQUFFLElBQUk7Q0FDdEIsQ0FBQTtBQVdEO0lBQUE7UUFFVSxZQUFPLEdBQWtCLDRCQUFvQixDQUFBO1FBQzdDLFdBQU0sR0FBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBd0p0RixDQUFDO0lBdEpDLElBQUksQ0FBRSxPQUF1QjtRQUMzQixJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1NBQ3ZCO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFO1lBQ2hELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsS0FBSyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDO2dCQUM5RixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtnQkFDcEYsS0FBSyxDQUFDLDhDQUE4QyxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQTthQUN6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