"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const netModule = require("net");
const metricConfig_1 = require("../utils/metricConfig");
const debug_1 = require("debug");
const debug = debug_1.default('axm:network');
class NetworkMetric {
    constructor(metricFeature) {
        this.defaultConf = {
            ports: false,
            traffic: true
        };
        this.metricFeature = metricFeature;
    }
    init(config) {
        config = metricConfig_1.default.getConfig(config, this.defaultConf);
        if (config.traffic) {
            this.catchTraffic(config.traffic);
        }
        if (config.ports) {
            this.catchPorts();
        }
    }
    destroy() {
        debug('NetworkMetric destroyed !');
    }
    catchPorts() {
        const portsList = [];
        let openedPorts = 'N/A';
        this.metricFeature.metric({
            name: 'Open ports',
            value: function () { return openedPorts; }
        });
        const originalListen = netModule.Server.prototype.listen;
        netModule.Server.prototype.listen = function () {
            const port = parseInt(arguments[0], 10);
            if (!isNaN(port) && portsList.indexOf(port) === -1) {
                portsList.push(port);
                openedPorts = portsList.sort().join();
            }
            this.once('close', function () {
                if (portsList.indexOf(port) > -1) {
                    portsList.splice(portsList.indexOf(port), 1);
                    openedPorts = portsList.sort().join();
                }
            });
            return originalListen.apply(this, arguments);
        };
    }
    catchTraffic(config) {
        let download = 0;
        let upload = 0;
        let up = '0 B/sec';
        let down = '0 B/sec';
        const filter = function (bytes) {
            let toFixed = 0;
            if (bytes < 1024) {
                toFixed = 6;
            }
            else if (bytes < (1024 * 1024)) {
                toFixed = 3;
            }
            else if (bytes !== 0) {
                toFixed = 2;
            }
            bytes = (bytes / (1024 * 1024)).toFixed(toFixed);
            let cutZeros = 0;
            for (let i = (bytes.length - 1); i > 0; --i) {
                if (bytes[i] === '.') {
                    ++cutZeros;
                    break;
                }
                if (bytes[i] !== '0')
                    break;
                ++cutZeros;
            }
            if (cutZeros > 0) {
                bytes = bytes.slice(0, -(cutZeros));
            }
            return (bytes + ' MB/s');
        };
        const interval = setInterval(function () {
            up = filter(upload);
            down = filter(download);
            upload = 0;
            download = 0;
        }, 999);
        interval.unref();
        if (config === true || config.download === true) {
            this.metricFeature.metric({
                name: 'Network Download',
                agg_type: 'sum',
                value: function () {
                    return down;
                }
            });
        }
        if (config === true || config.upload === true) {
            this.metricFeature.metric({
                name: 'Network Upload',
                agg_type: 'sum',
                value: function () {
                    return up;
                }
            });
        }
        if (config === true || config.upload === true) {
            const originalWrite = netModule.Socket.prototype.write;
            netModule.Socket.prototype.write = function (data) {
                if (data.length) {
                    upload += data.length;
                }
                return originalWrite.apply(this, arguments);
            };
        }
        if (config === true || config.download === true) {
            const originalRead = netModule.Socket.prototype.read;
            netModule.Socket.prototype.read = function () {
                if (!this.monitored) {
                    this.monitored = true;
                    this.on('data', function (data) {
                        if (data.length) {
                            download += data.length;
                        }
                    });
                }
                return originalRead.apply(this, arguments);
            };
        }
    }
}
exports.default = NetworkMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tZXRyaWNzL25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBZ0M7QUFHaEMsd0RBQWdEO0FBRWhELGlDQUF5QjtBQUN6QixNQUFNLEtBQUssR0FBRyxlQUFLLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFbEM7SUFRRSxZQUFhLGFBQTZCO1FBTGxDLGdCQUFXLEdBQUc7WUFDcEIsS0FBSyxFQUFFLEtBQUs7WUFDWixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUE7UUFHQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxDQUFFLE1BQU87UUFDWCxNQUFNLEdBQUcsc0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUV6RCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDbEM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1NBQ2xCO0lBQ0gsQ0FBQztJQUVELE9BQU87UUFDTCxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsVUFBVTtRQUNSLE1BQU0sU0FBUyxHQUFlLEVBQUUsQ0FBQTtRQUNoQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUE7UUFFdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDeEIsSUFBSSxFQUFNLFlBQVk7WUFDdEIsS0FBSyxFQUFLLGNBQWMsT0FBTyxXQUFXLENBQUEsQ0FBQyxDQUFDO1NBQzdDLENBQUMsQ0FBQTtRQUVGLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FB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