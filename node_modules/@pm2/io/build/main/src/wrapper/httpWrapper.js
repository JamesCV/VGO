"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = require("../utils/proxy");
class HttpWrapper {
    constructor(metricFeature) {
        this.metricFeature = metricFeature;
    }
    init(opts, http) {
        let glMeter;
        let glLatency;
        if (!opts.name)
            opts.name = 'http';
        glMeter = this.metricFeature.meter({
            name: opts.name.toUpperCase(),
            samples: 60,
            unit: 'req/min'
        });
        glLatency = this.metricFeature.histogram({
            measurement: 'mean',
            name: `pmx:${opts.name}:latency`,
            unit: 'ms'
        });
        const ignoreRoutes = function (url) {
            for (let i = 0; i < opts.ignore_routes.length; ++i) {
                if (url.match(opts.ignore_routes[i]) !== null) {
                    return true;
                }
            }
            return false;
        };
        proxy_1.default.wrap(http.Server.prototype, ['on', 'addListener'], function (addListener) {
            return function (event, listener) {
                const self = this;
                const overloadedFunction = function (request, response) {
                    glMeter.mark();
                    let httpStart = {
                        url: request.url,
                        start: Date.now()
                    };
                    response.once('finish', function () {
                        if (!ignoreRoutes(httpStart.url)) {
                            glLatency.update(Date.now() - httpStart.start);
                        }
                    });
                };
                if (!(event === 'request' && typeof listener === 'function')) {
                    return addListener.apply(self, arguments);
                }
                if (self.__overloaded !== true) {
                    self.on('removeListener', function onRemoveListener() {
                        setTimeout(function () {
                            if (self.listeners('request').length === 1) {
                                self.removeListener('request', overloadedFunction);
                                self.removeListener('removeListener', onRemoveListener);
                                self.__overloaded = false;
                            }
                        }, 200);
                    });
                    addListener.call(self, event, overloadedFunction);
                    self.__overloaded = true;
                }
                return addListener.apply(self, arguments);
            };
        });
        return http;
    }
}
exports.default = HttpWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvd3JhcHBlci9odHRwV3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBDQUFrQztBQUdsQztJQUlFLFlBQWEsYUFBNkI7UUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQUksQ0FBRSxJQUFJLEVBQUUsSUFBSTtRQUVkLElBQUksT0FBTyxDQUFBO1FBQ1gsSUFBSSxTQUFTLENBQUE7UUFFYixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtRQUVsQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzdCLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLFNBQVM7U0FDaEIsQ0FBQyxDQUFBO1FBRUYsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1lBQ3ZDLFdBQVcsRUFBRSxNQUFNO1lBQ25CLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLFVBQVU7WUFDaEMsSUFBSSxFQUFFLElBQUk7U0FDWCxDQUFDLENBQUE7UUFFRixNQUFNLFlBQVksR0FBRyxVQUFVLEdBQUc7WUFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDN0MsT0FBTyxJQUFJLENBQUE7aUJBQ1o7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxDQUFBO1FBRUQsZUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsRUFBRSxVQUFVLFdBQVc7WUFDNUUsT0FBTyxVQUFVLEtBQUssRUFBRSxRQUFRO2dCQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUE7Z0JBRWpCLE1BQU0sa0JBQWtCLEdBQUcsVUFBVSxPQUFPLEVBQUUsUUFBUTtvQkFDcEQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFBO29CQUVkLElBQUksU0FBUyxHQUFHO3dCQUNkLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRzt3QkFDaEIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7cUJBQ2xCLENBQUE7b0JBRUQsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBRXRCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFOzRCQUNoQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7eUJBQy9DO29CQUNILENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQTtnQkFFRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsQ0FBQyxFQUFFO29CQUM1RCxPQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO2lCQUMxQztnQkFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxFQUFFO29CQUU5QixJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFO3dCQUN4QixVQUFVLENBQUM7NEJBQ1QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0NBQzFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUE7Z0NBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtnQ0FDdkQsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUE7NkJBQzFCO3dCQUNILENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtvQkFDVCxDQUFDLENBQUMsQ0FBQTtvQkFFRixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtvQkFFakQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUE7aUJBQ3pCO2dCQUVELE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7WUFDM0MsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7Q0FDRjtBQW5GRCw4QkFtRkMifQ==