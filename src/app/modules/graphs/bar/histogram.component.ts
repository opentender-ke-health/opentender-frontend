import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Utils} from '../../../model/utils';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsPricesInYears} from '../../../app.interfaces';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';
import * as Config from '../../../../../config.dist.js';


@Component({
	selector: 'graph[histogram]',
	template: `
		<div class="graph-title" i18n>Tenders over Time</div>
		<div class="graph-toolbar-container">
			<div class="graph-toolbar graph-toolbar-left">
				<button class="tool-button" [ngClass]="{down:mode==='nr'}" (click)="toggleValue('nr')" i18n>Number of tenders</button>
				<button class="tool-button" [ngClass]="{down:mode==='vol'}" (click)="toggleValue('vol')" i18n>Total Volume ({{currencySymbol}})</button>
				<button class="tool-button" [ngClass]="{down:mode==='avg'}" (click)="toggleValue('avg')" i18n>Average Volume ({{currencySymbol}})</button>
			</div>
		</div>
		<ngx-charts-bar-vertical
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data">
		</ngx-charts-bar-vertical>
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphHistogramComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsPricesInYears;

	mode: string = 'nr';
	currencySymbol = Config.currencySymbol;

	lots_in_years: IChartBar = {
		chart: {
			view: {
				def: {width: 500, height: 360},
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
			colorScheme: Colors.colorSchemes.ordinal_1
		},
		data: null
	};

	sum_prices_in_years: IChartBar = {
		chart: {
			view: {
				def: {width: 500, height: 360},
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
				defaultWidth: 80,
				tickFormatting: (value: number) => {
					return this.i18n.formatCurrencyValue(<number>value);
				}
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatCurrencyValueEUR(<number>value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_1
		},
		data: null
	};

	avg_prices_in_years: IChartBar = {
		chart: {
			view: {
				def: {width: 500, height: 360},
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
				defaultWidth: 80,
				tickFormatting: (value: number) => {
					return this.i18n.formatCurrencyValue(value);
				}
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatCurrencyValueEUR(value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_1
		},
		data: null
	};

	graph: IChartBar = this.lots_in_years;

	constructor(private i18n: I18NService) {
		let year = this.i18n.get('Year');
		this.lots_in_years.chart.xAxis.label = year;
		this.lots_in_years.chart.yAxis.label = this.i18n.get('Nr. of Tenders');
		this.sum_prices_in_years.chart.xAxis.label = year;
		this.sum_prices_in_years.chart.yAxis.label = this.i18n.get(`Volume of Tenders (${this.currencySymbol})`);
		this.avg_prices_in_years.chart.xAxis.label = year;
		this.avg_prices_in_years.chart.yAxis.label = this.i18n.get(`Average Volume of Tenders (${this.currencySymbol})`);
		this.lots_in_years.chart.i18n = this.i18n.ChartsTranslations;
		this.avg_prices_in_years.chart.i18n = this.i18n.ChartsTranslations;
		this.sum_prices_in_years.chart.i18n = this.i18n.ChartsTranslations;
	}

	toggleValue(mode: string) {
		this.mode = mode;
		this.displayActive();
	}

	displayActive() {
		if (this.mode === 'nr') {
			this.graph = this.lots_in_years;
		} else if (this.mode === 'vol') {
			this.graph = this.sum_prices_in_years;
		} else if (this.mode === 'avg') {
			this.graph = this.avg_prices_in_years;
		}
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.yAxis.label, name: this.graph.chart.xAxis.label}, filename: 'histogram'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.lots_in_years.data = null;
			if (this.data) {
				this.lots_in_years.data = Object.keys(this.data).map((key) => {
					return {name: key, value: this.data[key].value};
				});
				if (this.lots_in_years.data.filter(item => item.value > 0).length === 0) {
					this.lots_in_years.data = [];
				}
				this.sum_prices_in_years.data = Object.keys(this.data).map((key) => {
					return {name: key, value: this.data[key].sum_finalPriceEUR.value || 0};
				});
				if (this.sum_prices_in_years.data.filter(item => item.value > 0).length === 0) {
					this.sum_prices_in_years.data = [];
				}
				this.avg_prices_in_years.data = Object.keys(this.data).map((key) => {
					return {name: key, value: this.data[key].avg_finalPriceEUR.value || 0};
				});
				if (this.avg_prices_in_years.data.filter(item => item.value > 0).length === 0) {
					this.avg_prices_in_years.data = [];
				}
			}
		}
	}

}
