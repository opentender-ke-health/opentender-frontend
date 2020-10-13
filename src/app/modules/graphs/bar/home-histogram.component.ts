import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsInYears} from '../../../app.interfaces';
import {Utils} from '../../../model/utils';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[home-histogram]',
	template: `
		<div class="graph-title" i18n>Number of public tenders per year</div>
		<ngx-charts-bar-vertical
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data">
		</ngx-charts-bar-vertical>
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphHomeHistogramComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsInYears;

	lots_in_years: IChartBar = {
		chart: {
			view: {
				def: {width: 1024, height: 320},
				min: {height: 320},
				max: {height: 320}
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
				defaultWidth: 44,
				minInterval: 1,
				tickFormatting: (value: number) => {
					return this.i18n.formatValue(value);
				}
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_1
		},
		data: null
	};

	graph: IChartBar = this.lots_in_years;

	constructor(private i18n: I18NService) {
		this.lots_in_years.chart.xAxis.label = this.i18n.get('Year');
		this.lots_in_years.chart.yAxis.label = this.i18n.get('Number of Tenders');
		this.lots_in_years.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.yAxis.label, name: 'Year'}, filename: 'histogram'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.lots_in_years.data = null;
		if (this.data) {
			this.lots_in_years.data = Object.keys(this.data).map((key) => {
				return {name: key, value: this.data[key]};
			});
		}
	}

}
