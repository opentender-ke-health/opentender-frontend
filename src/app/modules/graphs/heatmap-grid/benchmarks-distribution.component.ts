import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IBenchmarkFilter, ISeriesProvider, IStatsDistributionInYears} from '../../../app.interfaces';
import {IChartHeatmap} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {Utils} from '../../../model/utils';
import {I18NService} from '../../i18n/services/i18n.service';
import {IndicatorService} from '../../../services/indicator.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[benchmarks-distribution]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button>
				<p>Compare the selected tender to other tenders using different indicators. The colored dots show the distribution of the indicator values among all tenders. The gray bar indicates where the indicator value of the selected tender falls. The size of the dots reflects the number of tenders having the same indicator value. You can compare tenders either by the overall Good Procurement Score, which combines all Transparency and Integrity Indicators, or the individual Transparency or Integrity indicators.</p>
			</info-button>
		</div>
		<div class="benchmark-select">
			<div class="select-radios">
				<div i18n><strong>Indicator Group</strong></div>
				<label class="checkbox" *ngFor="let group of benchmark_groups">
					<input [value]="group" name="group" type="radio" [(ngModel)]="active.benchmark_group" (change)="handleGroupChange()">
					{{group.name}}
				</label>
			</div>
			<div class="select-radios" *ngIf="active.benchmark_group">
				<div i18n><strong>Indicator</strong></div>
				<label class="checkbox" *ngFor="let bench of active.benchmark_group.benchmarks">
					<input [value]="bench" name="bench" type="radio" [(ngModel)]="active.benchmark" (change)="handleBenchmarkChange()">
					{{bench.name}}
				</label>
			</div>
			<div class="select-checks" *ngIf="filters.length>0">
				<div i18n><strong>Comparison Group</strong></div>
				<label class="checkbox" *ngFor="let filter of filters">
					<input [value]="true" name="filter" type="checkbox" [(ngModel)]="filter.active" (change)="handleFilterChange()">
					{{filter.name}}
				</label>
			</div>
		</div>
		<ngx-charts-heat-map-grid
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data"
				[marker]="marker"></ngx-charts-heat-map-grid>
		<graph-footer [sender]="this"></graph-footer>
	`,
	styleUrls: ['../bar-grouped/benchmarks.component.scss']
})
export class GraphBenchmarksDistributionComponent implements OnChanges, ISeriesProvider {
	@Input()
	title: string;
	@Input()
	entityTitle: string;
	@Input()
	data: IStatsDistributionInYears;
	@Input()
	highlight: {
		year: string;
		values: {
			[key: string]: number;
		};
	};
	@Input()
	filters: Array<IBenchmarkFilter> = [];
	@Output()
	filtersChange = new EventEmitter();

	histogram_distribution: IChartHeatmap = {
		chart: {
			view: {
				def: {width: 1024, height: 360},
				min: {height: 360},
				max: {height: 360}
			},
			xAxis: {
				show: true,
				showLabel: true,
				minInterval: 1,
				defaultHeight: 20
			},
			yAxis: {
				show: true,
				showLabel: true,
				defaultWidth: 150,
				maxLength: 24,
			},
			showGridLines: true,
			gradient: false,
			valueFormatting: (value: number) => {
				return this.unit + ': ' + this.i18n.formatValue(value) + ' ' + this.i18n.get('Tenders');
			},
			colorScheme: Colors.colorSchemes.linear_red_green
		},
		data: null
	};

	graph = this.histogram_distribution;

	benchmark_groups = [];
	unit: string;
	active = {
		benchmark_group: null,
		benchmark: null
	};
	marker: {
		group: string;
		name: string;
		value: number;
		toolTipFormat: (mark) => string;
		title: string;
	} = {
		group: null,
		name: null,
		value: null,
		title: '',
		toolTipFormat: (mark) => {
			return mark.title + ': ' + this.i18n.formatValue(mark.value);
		}
	};

	constructor(private i18n: I18NService, private indicators: IndicatorService) {
		this.histogram_distribution.chart.yAxis.label = i18n.get('Year');
		this.histogram_distribution.chart.i18n = this.i18n.ChartsTranslations;
		this.unit = i18n.get('Comparison Group');
		this.marker.title = this.i18n.get('Current Tender');
		this.benchmark_groups = [];
		this.benchmark_groups.push({
			name: i18n.get('Overall'), benchmarks: [
				{name: indicators.TENDER.name, id: indicators.TENDER.id}
			]
		});
		indicators.GROUPS.forEach(indicator => {
			let group = {name: indicator.plural, benchmarks: [{name: indicator.name + ' ' + i18n.get('Score'), id: indicator.id}]};
			indicator.subindicators.forEach(sub => {
				group.benchmarks.push({name: sub.name, id: sub.id});

			});
			this.benchmark_groups.push(group);
		});
		this.active.benchmark_group = this.benchmark_groups[0];
		this.handleGroupChange();
	}


	getSeriesInfo() {
		return {data: this.graph.data, multi: true, header: {name: this.graph.chart.xAxis.label, value: this.graph.chart.yAxis.label}, filename: 'benchmark'};
	}

	getBucket(value: number): number {
		let offset = 0;
		let interval = 5;
		return Math.floor((value - offset) / interval) * interval + offset;
	}

	displayBenchmark(benchmark): void {
		this.graph.data = null;
		this.marker.group = null;
		this.marker.name = null;
		this.marker.value = null;
		if (benchmark && this.data) {
			if (this.highlight) {
				this.marker.group = this.highlight.year;
				if (this.highlight.values && this.highlight.values.hasOwnProperty(benchmark.id)) {
					this.marker.value = this.highlight.values[benchmark.id];
					this.marker.name = this.getBucket(this.marker.value).toString();
				}
			}
			this.graph.chart.xAxis.label = benchmark.name;
			let o = this.data[benchmark.id];
			if (!o) {
				this.graph.data = [];
				return;
			}
			let d = {};
			Object.keys(o).forEach(year => {
				let yd = o[year];
				for (let val = 0; val <= 100; val += 5) {
					d[val] = d[val] || {name: val.toString(), series: []};
					d[val].series.push({name: year, value: yd[val] || 0});
				}
			});
			this.graph.data = Object.keys(d).map(key => d[key]);
		}
	}

	handleGroupChange(): void {
		this.active.benchmark = null;
		if (this.active.benchmark_group) {
			this.active.benchmark = this.active.benchmark_group.benchmarks[0];
		}
		this.handleBenchmarkChange();
	}

	handleFilterChange(): void {
		this.filtersChange.emit({});
	}

	handleBenchmarkChange(): void {
		this.displayBenchmark(this.active.benchmark);
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.handleBenchmarkChange();
	}

}
