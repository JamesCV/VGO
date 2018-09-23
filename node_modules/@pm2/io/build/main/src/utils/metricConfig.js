"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("deepmerge");
class MetricConfig {
    static getConfig(config, defaultConf) {
        if (!config || config === true) {
            config = defaultConf;
        }
        else if (config !== 'all') {
            config = merge(defaultConf, config);
        }
        return config;
    }
    static initProbes(allPossibleMetrics, config, metricFeature) {
        const probes = {};
        for (let metricName in allPossibleMetrics) {
            if (allPossibleMetrics.hasOwnProperty(metricName) && (config === 'all' || config[metricName] === true)) {
                probes[metricName] = metricFeature.metric(allPossibleMetrics[metricName]);
            }
        }
        return probes;
    }
    static setProbesValue(allPossibleMetrics, metrics, probes, defaultUnit) {
        for (let metricName in metrics) {
            if (metrics.hasOwnProperty(metricName) && probes.hasOwnProperty(metricName)) {
                const value = (allPossibleMetrics[metricName].unit === defaultUnit) ? Math.round(metrics[metricName] / 1000) : metrics[metricName];
                probes[metricName].set(value);
            }
        }
    }
    static buildConfig(config) {
        if (typeof config === 'string') {
            config = {
                name: config
            };
        }
        return config;
    }
}
exports.default = MetricConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL21ldHJpY0NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFrQztBQUVsQztJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUUsTUFBTSxFQUFFLFdBQVc7UUFDbkMsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQzlCLE1BQU0sR0FBRyxXQUFXLENBQUE7U0FDckI7YUFBTSxJQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUU7WUFDM0IsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDcEM7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsVUFBVSxDQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxhQUFhO1FBQzFELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtRQUVqQixLQUFLLElBQUksVUFBVSxJQUFJLGtCQUFrQixFQUFFO1lBQ3pDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLEtBQUssSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ3RHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7YUFDMUU7U0FDRjtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXO1FBQ3JFLEtBQUssSUFBSSxVQUFVLElBQUksT0FBTyxFQUFFO1lBQzlCLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMzRSxNQUFNLEtBQUssR0FBRyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDbEksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUM5QjtTQUNGO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUUsTUFBTTtRQUN4QixJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUM5QixNQUFNLEdBQUc7Z0JBQ1AsSUFBSSxFQUFFLE1BQU07YUFDYixDQUFBO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRjtBQXpDRCwrQkF5Q0MifQ==