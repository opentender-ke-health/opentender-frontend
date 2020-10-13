import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Utils} from '../../../model/utils';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsInYears} from '../../../app.interfaces';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[score-histogram]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button>
				<p *ngFor="let text of tooltipTexts">{{text}}</p>
			</info-button>
		</div>
		<div class="graph-toolbar-container"></div>
		<ngx-charts-bar-vertical
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data">
		</ngx-charts-bar-vertical>
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphIndicatorScoreHistogramComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsInYears;
	@Input()
	title: string = '';
	@Input()
	glossary: string;
	@Input() tooltipTexts = [''];

	avg_score_in_years: IChartBar = {
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
				minInterval: 0.1,
				tickFormatting: (value: number) => {
					return this.i18n.formatValue(value);
				}
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatValue(value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.linear_red_green
		},
		data: null
	};

	graph: IChartBar = this.avg_score_in_years;

	constructor(private i18n: I18NService) {
		this.avg_score_in_years.chart.xAxis.label = this.i18n.get('Year');
		this.avg_score_in_years.chart.yAxis.label = this.i18n.get('Average Score');
		this.avg_score_in_years.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.title, name: 'Year'}, filename: 'histogram'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.avg_score_in_years.data = null;
			if (this.data) {
				this.avg_score_in_years.data = Object.keys(this.data).map((key) => {
					return {name: key, value: this.data[key]};
				});
			}
		}
	}

}
