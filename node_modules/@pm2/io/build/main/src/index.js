"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notify_1 = require("./features/notify");
const metrics_1 = require("./features/metrics");
const actions_1 = require("./features/actions");
const events_1 = require("./features/events");
const merge = require("deepmerge");
const configuration_1 = require("./configuration");
const metricConfig_1 = require("./utils/metricConfig");
const debug_1 = require("debug");
const serviceManager_1 = require("./serviceManager");
const debug = debug_1.default('PM2-IO-APM');
class PMX {
    constructor() {
        this.notifyFeature = new notify_1.NotifyFeature();
        this.metricsFeature = new metrics_1.default();
        this.actionsFeature = new actions_1.default(true);
        this.eventsFeature = new events_1.default();
        const eventLoopInspector = require('event-loop-inspector')(true);
        serviceManager_1.ServiceManager.set('eventLoopService', {
            inspector: eventLoopInspector
        });
    }
    init(config) {
        let notifyOptions = notify_1.NotifyOptionsDefault;
        let configMetrics = {};
        if (!config) {
            config = {};
        }
        if (config.level) {
            notifyOptions.level = config.level;
        }
        if (config.catchExceptions) {
            notifyOptions.catchExceptions = config.catchExceptions;
        }
        if (config.metrics) {
            configMetrics = config.metrics;
        }
        this.backwardConfigConversion(config);
        this.notifyFeature.init(notifyOptions);
        this.metricsFeature.init(config.metrics);
        this.actionsFeature.init(config.actions);
        configuration_1.default.init(config);
        return this;
    }
    destroy() {
        if (this.metricsFeature)
            this.metricsFeature.destroy();
        if (this.actionsFeature)
            this.actionsFeature.destroy();
    }
    notifyError(err, context) {
        let level = 'info';
        if (context && context.level) {
            level = context.level;
        }
        this.notifyFeature.notifyError(err, level);
    }
    metrics(metrics) {
        const res = {};
        let allMetrics = [];
        if (!Array.isArray(metrics)) {
            allMetrics[0] = metrics;
        }
        else {
            allMetrics = metrics;
        }
        for (let i = 0; i < allMetrics.length; i++) {
            const currentMetric = allMetrics[i];
            if (!currentMetric || !currentMetric.hasOwnProperty('name') || !currentMetric.hasOwnProperty('type')) {
                console.warn(`Metric can't be initialized : missing some properties !`);
                console.warn('name => required');
                console.warn('type => required');
                console.warn('id => optional');
                console.warn('unit => optional');
                console.warn('value => optional');
                console.warn('historic => optional');
                console.warn('agg_type => optional');
                console.warn('measurement => optional');
                continue;
            }
            // escape spaces and special characters from metric's name
            const metricKey = currentMetric.name.replace(/ /g, '_').replace(/[^\w\s]/gi, '');
            const type = currentMetric.type;
            currentMetric.type = currentMetric.id;
            delete currentMetric.id;
            if (typeof this.metricsFeature[type] !== 'function') {
                console.warn(`Metric ${currentMetric.name} cant be initialized : unknown type ${type} !`);
                continue;
            }
            res[metricKey] = this.metricsFeature[type](currentMetric);
        }
        return res;
    }
    histogram(config) {
        config = metricConfig_1.default.buildConfig(config);
        return this.metricsFeature['histogram'](config);
    }
    metric(config) {
        config = metricConfig_1.default.buildConfig(config);
        return this.metricsFeature['metric'](config);
    }
    counter(config) {
        config = metricConfig_1.default.buildConfig(config);
        return this.metricsFeature['counter'](config);
    }
    meter(config) {
        config = metricConfig_1.default.buildConfig(config);
        return this.metricsFeature['meter'](config);
    }
    action(name, opts, fn) {
        if (typeof name === 'object') {
            opts = name.opts;
            fn = name.action;
            name = name.name;
        }
        this.actionsFeature.action(name, opts, fn);
    }
    scopedAction(name, fn) {
        this.actionsFeature.scopedAction(name, fn);
    }
    transpose(variableName, reporter) {
        this.metricsFeature.transpose(variableName, reporter);
    }
    onExit(callback) {
        if (callback && typeof callback === 'function') {
            const onExit = require('signal-exit');
            return onExit(callback);
        }
    }
    // -----------------------------------------------------------
    // Retro compatibility
    // -----------------------------------------------------------
    probe() {
        console.warn('Deprecated : you should use io instead of io.probe() !');
        return {
            histogram: (histogram) => {
                return this.genericBackwardConversion(histogram, 'histogram');
            },
            meter: (meter) => {
                return this.genericBackwardConversion(meter, 'meter');
            },
            metric: (metric) => {
                return this.genericBackwardConversion(metric, 'metric');
            },
            counter: (counter) => {
                return this.genericBackwardConversion(counter, 'counter');
            },
            transpose: (variableName, reporter) => {
                this.transpose(variableName, reporter);
            }
        };
    }
    emit(name, data) {
        console.warn('Deprecated : emit() method will be removed in next major release !');
        this.eventsFeature.emit(name, data);
    }
    notify(notification) {
        console.warn('Deprecated : you should use io.notifyError() !');
        if (!(notification instanceof Error)) {
            notification = new Error(notification);
        }
        this.notifyFeature.notifyError(notification);
    }
    initModule(opts, cb) {
        if (!opts)
            opts = {};
        opts = merge({
            alert_enabled: true,
            widget: {}
        }, opts);
        opts.widget = merge({
            type: 'generic',
            logo: 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
            theme: ['#111111', '#1B2228', '#807C7C', '#807C7C']
        }, opts.widget);
        opts.isModule = true;
        opts = configuration_1.default.init(opts);
        if (cb && typeof (cb) === 'function')
            return cb(null, opts);
        return opts;
    }
    expressErrorHandler() {
        return this.notifyFeature.expressErrorHandler();
    }
    genericBackwardConversion(object, type) {
        if (typeof object !== 'object') {
            console.error('Parameter should be an object');
            return null;
        }
        object.type = type;
        // escape spaces and special characters from metric's name
        const metricKey = object.name.replace(/ /g, '_').replace(/[^\w\s]/gi, '');
        return this.metrics(object)[metricKey];
    }
    backwardConfigConversion(config) {
        // ------------------------------------------
        // Network
        // ------------------------------------------
        if (config.hasOwnProperty('network') || config.hasOwnProperty('ports')) {
            const networkConf = {};
            if (config.hasOwnProperty('network')) {
                networkConf.traffic = Boolean(config.network);
                delete config.network;
            }
            if (config.hasOwnProperty('ports')) {
                networkConf.ports = Boolean(config.ports);
                delete config.ports;
            }
            this.initMetricsConf(config);
            config.metrics.network = networkConf;
        }
        // ------------------------------------------
        // V8
        // ------------------------------------------
        if (config.hasOwnProperty('v8')) {
            this.initMetricsConf(config);
            config.metrics.v8 = config.v8;
            delete config.v8;
        }
        // ------------------------------------------
        // transactions
        // ------------------------------------------
        if (config.hasOwnProperty('transactions') || config.hasOwnProperty('http')) {
            this.initMetricsConf(config);
            config.metrics.transaction = {};
            if (config.hasOwnProperty('transactions')) {
                config.metrics.transaction.tracing = config.transactions;
                delete config.transactions;
            }
            if (config.hasOwnProperty('http')) {
                config.metrics.transaction.http = config.http;
                delete config.http;
            }
        }
        // ------------------------------------------
        // Deep metrics
        // ------------------------------------------
        if (config.hasOwnProperty('deep_metrics')) {
            this.initMetricsConf(config);
            config.metrics.deepMetrics = config.deep_metrics;
            delete config.deep_metrics;
        }
        // ------------------------------------------
        // Event Loop action
        // ------------------------------------------
        if (config.hasOwnProperty('event_loop_dump')) {
            this.initActionsConf(config);
            config.actions.eventLoopDump = config.event_loop_dump;
            delete config.event_loop_dump;
        }
        // ------------------------------------------
        // Profiling action
        // ------------------------------------------
        if (config.hasOwnProperty('profiling')) {
            this.initActionsConf(config);
            config.actions = {
                profilingCpu: config.profiling,
                profilingHeap: config.profiling
            };
            delete config.profiling;
        }
    }
    initMetricsConf(config) {
        if (!config.metrics) {
            config.metrics = {};
        }
    }
    initActionsConf(config) {
        if (!config.actions) {
            config.actions = {};
        }
    }
}
// -----------------------------------
// create a unique, global symbol name
// -----------------------------------
const IO_KEY = Symbol.for('@pm2/io');
// ------------------------------------------
// check if the global object has this symbol
// add it if it does not have the symbol, yet
// ------------------------------------------
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasKey = (globalSymbols.indexOf(IO_KEY) > -1);
if (!hasKey) {
    global[IO_KEY] = new PMX();
}
class Entrypoint {
    constructor() {
        this.defaultConf = {
            metrics: {
                eventLoopActive: true,
                eventLoopDelay: true,
                network: {
                    traffic: false,
                    ports: false
                },
                transaction: {
                    http: true,
                    tracing: false
                },
                deepMetrics: false,
                v8: false
            },
            actions: {
                eventLoopDump: false,
                profilingCpu: true,
                profilingHeap: true
            }
        };
        try {
            this.io = global[IO_KEY].init(this.conf());
            this.onStart(err => {
                if (err) {
                    debug(err);
                }
                this.metrics();
                this.actions();
                this.io.onExit((code, signal) => {
                    this.onStop(err, () => {
                        this.io.destroy();
                    }, code, signal);
                });
                if (process && process.send)
                    process.send('ready');
            });
        }
        catch (e) {
            // properly exit in case onStart/onStop method has not been override
            if (this.io) {
                this.io.destroy();
            }
            throw (e);
        }
    }
    metrics() {
        debug('No metrics !');
    }
    actions() {
        debug('No actions !');
    }
    onStart(cb) {
        throw new Error('Entrypoint onStart() not specified');
    }
    onStop(err, cb, code, signal) {
        cb(); // by default only execute callback
    }
    conf() {
        return this.defaultConf;
    }
}
if (!hasKey) {
    global[IO_KEY].Entrypoint = Entrypoint;
    // Freeze API, cannot be modified
    Object.freeze(global[IO_KEY]);
}
module.exports = global[IO_KEY];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBc0Y7QUFDdEYsZ0RBQStDO0FBQy9DLGdEQUErQztBQUMvQyw4Q0FBNEM7QUFFNUMsbUNBQWtDO0FBQ2xDLG1EQUEyQztBQUMzQyx1REFBOEM7QUFDOUMsaUNBQXlCO0FBQ3pCLHFEQUFpRDtBQUNqRCxNQUFNLEtBQUssR0FBRyxlQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7QUFFakM7SUFPRTtRQUNFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUE7UUFDeEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGlCQUFjLEVBQUUsQ0FBQTtRQUMxQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksaUJBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksZ0JBQVksRUFBRSxDQUFBO1FBRXZDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEUsK0JBQWMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUU7WUFDckMsU0FBUyxFQUFFLGtCQUFrQjtTQUM5QixDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFFLE1BQU87UUFDWCxJQUFJLGFBQWEsR0FBa0IsNkJBQW9CLENBQUE7UUFDdkQsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFBO1FBRXRCLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxNQUFNLEdBQUcsRUFBRSxDQUFBO1NBQ1o7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsYUFBYSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFBO1NBQ25DO1FBQ0QsSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzFCLGFBQWEsQ0FBQyxl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