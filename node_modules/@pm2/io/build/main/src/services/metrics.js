"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const v8_1 = require("../metrics/v8");
const eventLoopDelay_1 = require("../metrics/eventLoopDelay");
const metricConfig_1 = require("../utils/metricConfig");
const eventLoopHandlesRequests_1 = require("../metrics/eventLoopHandlesRequests");
const transaction_1 = require("../metrics/transaction");
const network_1 = require("../metrics/network");
const debug = debug_1.default('axm:metricService');
class MetricsService {
    constructor(metricsFeature) {
        this.defaultConf = {
            eventLoopDelay: true,
            eventLoopActive: true,
            transaction: { http: true }
        };
        this.metricsFeature = metricsFeature;
        this.services = new Map();
        this.services.set('v8', new v8_1.default(metricsFeature));
        this.services.set('eventLoopDelay', new eventLoopDelay_1.default(metricsFeature));
        this.services.set('eventLoopActive', new eventLoopHandlesRequests_1.default(metricsFeature));
        this.services.set('transaction', new transaction_1.default(metricsFeature));
        this.services.set('network', new network_1.default(metricsFeature));
    }
    init(config, force) {
        if (!force) {
            config = metricConfig_1.default.getConfig(config, this.defaultConf);
        }
        // init metrics only if they are enabled in config
        for (let property in config) {
            if (config.hasOwnProperty(property) && config[property] !== false) {
                if (property === 'deepMetrics') {
                    const DeepMetrics = require('../metrics/deepMetrics').default;
                    this.services.set('deepMetrics', new DeepMetrics(this.metricsFeature));
                }
                if (!this.services.has(property)) {
                    debug(`Metric ${property} does not exist`);
                    continue;
                }
                const subConf = config[property];
                this.services.get(property).init(subConf);
            }
        }
    }
    destroyAll() {
        this.services.forEach((service, serviceName) => {
            if (service.destroy && typeof service.destroy === 'function') {
                service.destroy();
            }
        });
    }
    get(name) {
        if (!this.services.has(name)) {
            debug(`Service ${name} not found !`);
            return null;
        }
        return this.services.get(name);
    }
}
exports.default = MetricsService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXlCO0FBQ3pCLHNDQUE4QjtBQUU5Qiw4REFBNEQ7QUFDNUQsd0RBQWdEO0FBQ2hELGtGQUFnRjtBQUNoRix3REFBZ0Q7QUFDaEQsZ0RBQThDO0FBRTlDLE1BQU0sS0FBSyxHQUFHLGVBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBRXhDO0lBV0UsWUFBYSxjQUE4QjtRQU5uQyxnQkFBVyxHQUFHO1lBQ3BCLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7U0FDNUIsQ0FBQTtRQUdDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxZQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtRQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLHdCQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7UUFDN0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxrQ0FBOEIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1FBQ3hGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLHFCQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtRQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxpQkFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7SUFDakUsQ0FBQztJQUVELElBQUksQ0FBRSxNQUFPLEVBQUUsS0FBTTtRQUVuQixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1YsTUFBTSxHQUFHLHNCQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7U0FDMUQ7UUFFRCxrREFBa0Q7UUFDbEQsS0FBSyxJQUFJLFFBQVEsSUFBSSxNQUFNLEVBQUU7WUFDM0IsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLEVBQUU7Z0JBRWpFLElBQUksUUFBUSxLQUFLLGFBQWEsRUFBRTtvQkFDOUIsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUMsT0FBTyxDQUFBO29CQUM3RCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7aUJBQ3ZFO2dCQUVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDaEMsS0FBSyxDQUFDLFVBQVUsUUFBUSxpQkFBaUIsQ0FBQyxDQUFBO29CQUMxQyxTQUFRO2lCQUNUO2dCQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2FBQzFDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsVUFBVTtRQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFO1lBQzdDLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO2dCQUM1RCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7YUFDbEI7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxHQUFHLENBQUUsSUFBWTtRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QixLQUFLLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxDQUFBO1lBQ3BDLE9BQU8sSUFBSSxDQUFBO1NBQ1o7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hDLENBQUM7Q0FDRjtBQS9ERCxpQ0ErREMifQ==