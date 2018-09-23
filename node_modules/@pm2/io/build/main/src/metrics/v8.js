"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v8 = require("v8");
const module_1 = require("../utils/module");
const metricConfig_1 = require("../utils/metricConfig");
const debug_1 = require("debug");
const debug = debug_1.default('axm:v8');
class V8Metric {
    constructor(metricFeature) {
        this.unitKB = 'kB';
        this.allPossibleMetrics = {
            new_space: {
                name: 'New space used size',
                type: 'v8/heap/space/new',
                unit: this.unitKB,
                historic: true
            },
            old_space: {
                name: 'Old space used size',
                type: 'v8/heap/space/old',
                unit: this.unitKB,
                historic: true
            },
            map_space: {
                name: 'Map space used size',
                type: 'v8/heap/space/map',
                unit: this.unitKB,
                historic: false
            },
            code_space: {
                name: 'Code space used size',
                type: 'v8/heap/space/code',
                unit: this.unitKB,
                historic: false
            },
            large_object_space: {
                name: 'Large object space used size',
                type: 'v8/heap/space/large',
                unit: this.unitKB,
                historic: false
            },
            total_physical_size: {
                name: 'Heap physical size',
                type: 'v8/heap/physical',
                unit: 'kB',
                historic: false
            },
            total_heap_size: {
                name: 'Heap size',
                type: 'v8/heap/used',
                unit: 'kB',
                historic: true
            },
            total_available_size: {
                name: 'Heap available size',
                type: 'v8/heap/available',
                unit: 'kB',
                historic: true
            },
            total_heap_size_executable: {
                name: 'Heap size executable',
                type: 'v8/heap/executable',
                unit: this.unitKB,
                historic: false
            },
            used_heap_size: {
                name: 'Used heap size',
                type: 'v8/heap/used',
                unit: this.unitKB,
                historic: true
            },
            heap_size_limit: {
                name: 'Heap size limit',
                type: 'v8/heap/limit',
                unit: this.unitKB,
                historic: true
            },
            malloced_memory: {
                name: 'Malloced memory',
                type: 'v8/heap/malloced',
                unit: this.unitKB,
                historic: false
            },
            peak_malloced_memory: {
                name: 'Peak malloced memory',
                type: 'v8/heap/peakmalloced',
                unit: this.unitKB,
                historic: false
            },
            does_zap_garbage: {
                name: 'Zap garbage',
                type: 'v8/heap/zapgarbage',
                unit: '',
                historic: false
            }
        };
        this.allPossibleMetricsGC = {
            totalHeapSize: {
                name: 'GC Heap size',
                type: 'v8/gc/heap/size',
                unit: this.unitKB,
                historic: true
            },
            totalHeapExecutableSize: {
                name: 'GC Executable heap size',
                type: 'v8/gc/heap/executable',
                unit: this.unitKB,
                historic: false
            },
            usedHeapSize: {
                name: 'GC Used heap size',
                type: 'v8/gc/heap/used',
                unit: this.unitKB,
                historic: true
            },
            heapSizeLimit: {
                name: 'GC heap size limit',
                type: 'v8/gc/heap/limit',
                unit: this.unitKB,
                historic: false
            },
            totalPhysicalSize: {
                name: 'GC physical size',
                type: 'v8/gc/heap/physical',
                unit: this.unitKB,
                historic: false
            },
            totalAvailableSize: {
                name: 'GC available size',
                type: 'v8/gc/heap/available',
                unit: this.unitKB,
                historic: false
            },
            mallocedMemory: {
                name: 'GC malloced memory',
                type: 'v8/gc/heap/malloced',
                unit: this.unitKB,
                historic: false
            },
            peakMallocedMemory: {
                name: 'GC peak malloced memory',
                type: 'v8/gc/heap/peakmalloced',
                unit: this.unitKB,
                historic: false
            },
            gcType: {
                name: 'GC Type',
                type: 'v8/gc/type',
                historic: false
            },
            gcPause: {
                name: 'GC Pause',
                type: 'v8/gc/pause',
                unit: 'ms',
                historic: false
            }
        };
        this.defaultConf = {
            new_space: true,
            old_space: true,
            map_space: true,
            code_space: true,
            large_object_space: true,
            total_heap_size: true,
            total_heap_size_executable: true,
            used_heap_size: true,
            heap_size_limit: true,
            GC: {
                totalHeapSize: true,
                totalHeapExecutableSize: true,
                usedHeapSize: true,
                gcType: true,
                gcPause: true
            }
        };
        this.TIME_INTERVAL = 1000;
        this.metricFeature = metricFeature;
    }
    init(config) {
        config = metricConfig_1.default.getConfig(config, this.defaultConf);
        let heapProbes;
        const self = this;
        if (v8.hasOwnProperty('getHeapSpaceStatistics') && v8.hasOwnProperty('getHeapStatistics')) {
            heapProbes = metricConfig_1.default.initProbes(this.allPossibleMetrics, config, this.metricFeature);
        }
        this.timer = setInterval(function () {
            if (v8.hasOwnProperty('getHeapSpaceStatistics')) {
                const data = v8.getHeapSpaceStatistics();
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (heapProbes.hasOwnProperty(item.space_name)) {
                        heapProbes[item.space_name].set(Math.round(item.space_used_size / 1000));
                    }
                }
            }
            if (v8.hasOwnProperty('getHeapStatistics')) {
                const heapStats = v8.getHeapStatistics();
                metricConfig_1.default.setProbesValue(this.allPossibleMetrics, heapStats, heapProbes, self.unitKB);
            }
        }.bind(this), this.TIME_INTERVAL);
        this.timer.unref();
        module_1.default.detectModule('gc-stats', (err, gcPath) => {
            if (err) {
                return false;
            }
            return this._sendGCStats(gcPath, config.GC);
        });
    }
    destroy() {
        clearInterval(this.timer);
    }
    _sendGCStats(gcPath, config) {
        let gc;
        try {
            gc = (require(gcPath))();
        }
        catch (e) {
            debug('error when requiring gc-stats on path', gcPath);
            debug(e);
            return false;
        }
        config = metricConfig_1.default.getConfig(config, this.defaultConf.GC);
        const gcProbes = metricConfig_1.default.initProbes(this.allPossibleMetricsGC, config, this.metricFeature);
        const self = this;
        gc.on('stats', (stats) => {
            metricConfig_1.default.setProbesValue(this.allPossibleMetricsGC, stats.after, gcProbes, self.unitKB);
            gcProbes['gcType'].set(stats.gctype);
            gcProbes['gcPause'].set(Math.round(stats.pause / 1000000)); // convert to milliseconds (cause pauseMs seems to use Math.floor)
        });
    }
}
exports.default = V8Metric;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWV0cmljcy92OC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUF3QjtBQUN4Qiw0Q0FBbUM7QUFHbkMsd0RBQWdEO0FBRWhELGlDQUF5QjtBQUN6QixNQUFNLEtBQUssR0FBRyxlQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7QUFFN0I7SUFnTEUsWUFBYSxhQUE2QjtRQTFLbEMsV0FBTSxHQUFHLElBQUksQ0FBQTtRQUViLHVCQUFrQixHQUFHO1lBQzNCLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ2pCLFFBQVEsRUFBRSxJQUFJO2FBQ2Y7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLHFCQUFxQjtnQkFDM0IsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNqQixRQUFRLEVBQUUsSUFBSTthQUNmO1lBQ0QsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDaEI7WUFDRCxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNoQjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixJQUFJLEVBQUUsOEJBQThCO2dCQUNwQyxJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU07Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2hCO1lBQ0QsbUJBQW1C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