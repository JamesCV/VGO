"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventLoopDelayMetric {
    constructor(metricFeature) {
        this.TIME_INTERVAL = 1000;
        this.metricFeature = metricFeature;
    }
    init(config) {
        let oldTime = process.hrtime();
        const histogram = this.metricFeature.histogram({
            name: 'Loop delay',
            type: 'libuv/latency',
            measurement: 'mean',
            unit: 'ms'
        });
        if (histogram) {
            this.timer = setInterval(() => {
                const newTime = process.hrtime();
                const delay = (newTime[0] - oldTime[0]) * 1e3 + (newTime[1] - oldTime[1]) / 1e6 - this.TIME_INTERVAL;
                oldTime = newTime;
                histogram.update(delay);
            }, this.TIME_INTERVAL);
            this.timer.unref();
        }
    }
    destroy() {
        clearInterval(this.timer);
    }
}
exports.default = EventLoopDelayMetric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRMb29wRGVsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWV0cmljcy9ldmVudExvb3BEZWxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBO0lBTUUsWUFBYSxhQUE2QjtRQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtRQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsSUFBSSxDQUFFLE1BQXNCO1FBQzFCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUU5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztZQUM3QyxJQUFJLEVBQUUsWUFBWTtZQUNsQixJQUFJLEVBQUUsZUFBZTtZQUNyQixXQUFXLEVBQUUsTUFBTTtZQUNuQixJQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQTtRQUVGLElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUM1QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtnQkFDcEcsT0FBTyxHQUFHLE9BQU8sQ0FBQTtnQkFDakIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN6QixDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBRXRCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUE7U0FDbkI7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDM0IsQ0FBQztDQUNGO0FBcENELHVDQW9DQyJ9