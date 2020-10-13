import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Utils} from '../../../model/utils';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsProcedureType} from '../../../app.interfaces';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[procedure-types]',
	template: `
		<div class="graph-title">{{title}}</div>
		<div class="graph-toolbar-container"></div>
		<ngx-charts-bar-horizontal-labeled
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data">
		</ngx-charts-bar-horizontal-labeled>
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphProcedureTypesComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsProcedureType;
	@Input()
	title: string = '';

	procedure_types_absolute: IChartBar = {
		chart: {
			view: {
				def: {width: 500, height: 360},
				min: {height: 360},
				max: {height: 360}
			},
			xAxis: {
				show: true,
				showLabel: true,
				minInterval: 1,
				defaultHeight: 20,
				tickFormatting: Utils.formatTrunc
			},
			yAxis: {
				show: false,
				showLabel: true,
				defaultWidth: 150,
				maxLength: 24,
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatValue(value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_2
		},
		data: null
	};

	graph: IChartBar = this.procedure_types_absolute;

	constructor(private i18n: I18NService) {
		this.procedure_types_absolute.chart.xAxis.label = this.i18n.get('Number of tenders');
		this.procedure_types_absolute.chart.yAxis.label = this.i18n.get('Procedure Type');
		this.procedure_types_absolute.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.xAxis.label, name: 'Procedure Type'}, filename: 'procedure_types'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.procedure_types_absolute.data = null;
			if (this.data) {
				this.procedure_types_absolute.data = Object.keys(this.data).map((key) => {
					return {id: key, name: Utils.expandUnderlined(key), value: this.data[key]};
				}).sort((a, b) => {
					if (a.value > b.value) {
						return 1;
					}
					if (a.value < b.value) {
						return -1;
					}
					return 0;
				});
			}
		}
	}

}
