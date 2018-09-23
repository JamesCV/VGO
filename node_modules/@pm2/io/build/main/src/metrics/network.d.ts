import MetricsFeature from '../features/metrics';
import MetricsInterface from './metricsInterface';
export default class NetworkMetric implements MetricsInterface {
    private metricFeature;
    private defaultConf;
    constructor(metricFeature: MetricsFeature);
    init(config?: any): void;
    destroy(): void;
    catchPorts(): void;
    catchTraffic(config: any): void;
}
