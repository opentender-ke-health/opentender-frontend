import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IBenchmarkFilter, ISeriesProvider, IStats} from '../../../app.interfaces';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {Utils} from '../../../model/utils';
import {I18NService} from '../../i18n/services/i18n.service';
import {IndicatorService} from '../../../services/indicator.service';
import {Colors} from '../../../model/colors';
import * as Config from '../../../../../config.dist.js';


@Component({
	selector: 'graph[benchmarks]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button>
				<p *ngFor="let text of tooltip">{{text}}</p>
			</info-button>
		</div>
		<div class="benchmark-select">
			<div class="select-radios">
				<div i18n>Indicator Group</div>
				<label class="checkbox" *ngFor="let group of benchmark_groups">
					<input [value]="group" name="group" type="radio" [(ngModel)]="active.benchmark_group" (change)="handleGroupChange()">
					{{group.name}}
				</label>
			</div>
			<div class="select-radios" *ngIf="active.benchmark_group">
				<div i18n>Indicator</div>
				<label class="checkbox" *ngFor="let bench of active.benchmark_group.benchmarks">
					<input [value]="bench" name="bench" type="radio" [(ngModel)]="active.benchmark" (change)="handleBenchmarkChange()">
					{{bench.name}}
				</label>
			</div>
			<div class="select-checks" *ngIf="filters && filters.length>0">
				<div i18n>Comparison Group</div>
				<label class="checkbox" *ngFor="let filter of filters">
					<input [value]="true" name="filter" type="checkbox" [(ngModel)]="filter.active" (change)="handleFilterChange()">
					{{filter.name}}
				</label>
			</div>
		</div>
		<ngx-charts-bar-vertical-grouped
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data">
		</ngx-charts-bar-vertical-grouped>
		<graph-footer [colsGraDLegend]="footerLegend" [sender]="this"></graph-footer>
	`,
	styleUrls: ['benchmarks.component.scss']
})
export class GraphBenchmarksComponent implements OnChanges, ISeriesProvider {
	@Input() title: string;
	@Input() entityTitle: string;
	@Input() data: IStats;
	@Input() filters: Array<IBenchmarkFilter> = [];
	@Input() footerLegend;
	@Input() tooltip = [''];
	@Output() filtersChange = new EventEmitter();
	currencySymbol = Config.currencySymbol;

	in_years: IChartBar = {
		chart: {
			view: {
				def: {width: 1024, height: 360},
				min: {height: 360},
				max: {height: 360}
			},
			xAxis: {
				show: true,
				showLabel: true,
				defaultHeight: 20,
				tickFormatting: Utils.formatYear
			},
			yAxis: {
				show: true,
				showLabel: true,
				defaultWidth: 30,
				minInterval: 1,
				tickFormatting: Utils.formatTrunc
			},
			valueFormatting: Utils.formatTrunc,
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_dual
		},
		data: null
	};

	graph = this.in_years;

	benchmark_groups = [];
	othersTitle: string;
	active = {
		benchmark_group: null,
		benchmark: null
	};

	constructor(private i18n: I18NService, private indicators: IndicatorService) {
		this.in_years.chart.xAxis.label = i18n.get('Year');
		this.in_years.chart.i18n = this.i18n.ChartsTranslations;
		this.othersTitle = this.i18n.get('Average in Comparison Group');
		this.benchmark_groups = [];
		this.benchmark_groups.push({
			name: i18n.get('Overall'), benchmarks: [
				{name: indicators.TENDER.name, id: indicators.TENDER.id, build: 'scores'}
			]
		});
		indicators.GROUPS.forEach(indicator => {
			let group = {name: indicator.plural, benchmarks: [{name: indicator.name + ' ' + i18n.get('Score'), id: indicator.id, build: 'scores'}]};
			indicator.subindicators.forEach(sub => {
				group.benchmarks.push({name: sub.name, id: sub.id, build: 'scores'});
			});
			this.benchmark_groups.push(group);
		});
		this.benchmark_groups.push({
			name: i18n.get('Contract Values'), benchmarks: [
				{name: i18n.get(`Average Value (${this.currencySymbol})`), id: 'avg_finalPriceEUR', build: 'values'}
			]
		});
		this.active.benchmark_group = this.benchmark_groups[0];
		this.handleGroupChange();
	}

	collectYears(entity, compare): Array<string> {
		let years = Object.keys(entity);
		Object.keys(compare).forEach(key => {
			if (years.indexOf(key) < 0) {
				years.push(key);
			}
		});
		years.sort((a, b) => {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		});
		return years;
	}

	buildCompareScoreSeries(stats: IStats, id: string) {
		let entity = stats.histogram_indicators ? stats.histogram_indicators[id] : null;
		let compare = stats.benchmark ? stats.benchmark.histogram_indicators[id] : null;
		if (!entity || !compare) {
			return [];
		}
		let series = [];
		let years = this.collectYears(entity, compare);
		years.forEach(year => {
			let sub = {name: year, series: []};
			if (entity[year] !== undefined) {
				sub.series.push({name: this.i18n.nameGuard(this.entityTitle), value: entity[year]});
			} else {
				sub.series.push({name: this.i18n.nameGuard(this.entityTitle), value: 0, replacement: this.i18n.ChartsTranslations.no_data});
			}
			if (compare[year] !== undefined) {
				sub.series.push({name: this.othersTitle, value: compare[year]});
			} else {
				sub.series.push({name: this.othersTitle, value: 0, replacement: this.i18n.ChartsTranslations.no_data});
			}
			series.push(sub);
		});
		return series;
	}

	buildCompareValueSeries(stats: IStats, id: string) {
		let entity = stats.histogram_finalPriceEUR;
		let compare = stats.benchmark ? stats.benchmark.histogram_finalPriceEUR : null;
		if (!entity || !compare) {
			return [];
		}
		let series = [];
		let years = this.collectYears(entity, compare);
		years.forEach(year => {
			let sub = {name: year, series: []};
			if (entity[year] && entity[year][id] && entity[year][id].value !== null) {
				sub.series.push({name: this.entityTitle, value: entity[year][id].value});
			} else {
				sub.series.push({name: this.entityTitle, value: 0, replacement: this.i18n.ChartsTranslations.no_data});
			}
			if (compare[year] && compare[year][id] && compare[year][id].value !== null) {
				sub.series.push({name: this.othersTitle, value: compare[year][id].value});
			} else {
				sub.series.push({name: this.othersTitle, value: 0, replacement: this.i18n.ChartsTranslations.no_data});
			}
			series.push(sub);
		});
		return series;
	}

	getSeriesInfo() {
		return {data: this.graph.data, multi: true, header: {name: this.graph.chart.xAxis.label, value: this.graph.chart.yAxis.label}, filename: 'benchmark'};
	}

	displayBenchmark(benchmark): void {
		this.in_years.data = null;
		if (benchmark && this.data) {
			this.graph.chart.yAxis.label = benchmark.name;
			if (benchmark.build === 'values') {
				this.graph.chart.yAxis.defaultWidth = 60;
				this.graph.chart.yAxis.tickFormatting = (value) => {
					return this.i18n.formatCurrencyValue(<number>value);
				};
				this.graph.chart.valueFormatting = (value) => {
					return this.i18n.formatCurrencyValueEUR(<number>value);
				};
				this.in_years.data = this.buildCompareValueSeries(this.data, benchmark.id);
			} else {
				this.graph.chart.yAxis.defaultWidth = 20;
				this.graph.chart.yAxis.tickFormatting = Utils.formatTrunc;
				this.graph.chart.valueFormatting = Utils.formatTrunc;
				this.in_years.data = this.buildCompareScoreSeries(this.data, benchmark.id);
			}
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
