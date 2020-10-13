import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Utils} from '../../../model/utils';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsPcCpvs} from '../../../app.interfaces';
import {Router} from '@angular/router';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[indicator-sectors]',
	template: `
		<div class="graph-title" i18n>
			{{title}} per Sector
			<info-button>
				<p>Click on any of the bars to get more details on the sector. Contracts are categorized into sectors by defining product markets (CPV codes) based on the contract information. See more on the details of contract categorization and the CPV nomenclature in the Data Explainer on the About page.</p>
			</info-button>
		</div>
		<div class="graph-toolbar-container">
			<div class="graph-toolbar graph-toolbar-right">
				<button class="tool-button" [ngClass]="{down:this.graph==this.cpvs_codes_average}" (click)="this.graph=this.cpvs_codes_average" i18n>Share (%)</button>
				<button class="tool-button" [ngClass]="{down:this.graph==this.cpvs_codes_absolute}" (click)="this.graph=this.cpvs_codes_absolute" i18n>Absolute</button>
			</div>
		</div>
		<ngx-charts-bar-horizontal-labeled
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data"
				(select)="graph.select($event)">
		</ngx-charts-bar-horizontal-labeled>
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphIndicatorSectorsComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsPcCpvs;
	@Input()
	title: string = '';

	cpvs_codes_average: IChartBar = {
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
			valueFormatting: Utils.formatPercent,
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_2
		},
		select: (event) => {
			if (event.id) {
				this.router.navigate(['/sector/' + event.id]);
			}
		},
		data: null
	};
	cpvs_codes_absolute: IChartBar = {
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
				minInterval: 1,
				tickFormatting: Utils.formatTrunc
			},
			yAxis: {
				show: false,
				showLabel: true,
				defaultWidth: 150,
				maxLength: 24
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatValue(value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_2
		},
		select: (event) => {
			if (event.id) {
				this.router.navigate(['/sector/' + event.id]);
			}
		},
		data: null
	};

	graph: IChartBar = this.cpvs_codes_average;

	constructor(private router: Router, private i18n: I18NService) {
		this.cpvs_codes_average.chart.xAxis.label = this.i18n.get('% of Tenders');
		this.cpvs_codes_average.chart.yAxis.label = this.i18n.get('Sector (CPV Division)');
		this.cpvs_codes_absolute.chart.xAxis.label = this.i18n.get('Number of tenders');
		this.cpvs_codes_absolute.chart.yAxis.label = this.i18n.get('Sector (CPV Division)');
		this.cpvs_codes_average.chart.i18n = this.i18n.ChartsTranslations;
		this.cpvs_codes_absolute.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		let codes = Object.keys(this.data).map((key) => {
			return {id: key, name: this.data[key].name, value: this.data[key].value, percent: this.data[key].percent};
		});
		let series;
		if (this.graph === this.cpvs_codes_average) {
			series = codes.map((code) => {
				return {id: code.id, name: code.name, value: code.percent};
			});
		} else {
			series = codes.map((code) => {
				return {id: code.id, name: code.name, value: code.value};
			});
		}
		return {data: series, header: {value: this.graph.chart.xAxis.label, name: 'CPV Name', id: 'CPV Nr.'}, filename: this.title + '-per-sector'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.cpvs_codes_average.data = null;
		this.cpvs_codes_absolute.data = null;
		if (this.data) {
			let codes = Object.keys(this.data).map((key) => {
				return {id: key, name: this.data[key].name, value: this.data[key].value, percent: this.data[key].percent};
			});
			this.cpvs_codes_average.data = codes.map((code) => {
				return {id: code.id, name: code.name, value: code.percent};
			}).sort((a, b) => {
				if (a.value < b.value) {
					return -1;
				}
				if (a.value > b.value) {
					return 1;
				}
				return 0;
			});
			let othergroup = null;
			let othergroupcount = 0;
			while (this.cpvs_codes_average.data.length - 8 > 2) {
				if (!othergroup) {
					othergroup = {name: '', value: 0};
				}
				let item = this.cpvs_codes_average.data.shift();
				othergroup.value = item.value;
				othergroupcount++;
				othergroup.name = this.i18n.getFormat('[{{count}} other sectors with less than {{value}}]', [{key: 'count', value: othergroupcount}, {key: 'value', value: Utils.formatPercent(item.value)}]);
			}
			if (othergroup) {
				this.cpvs_codes_average.data.unshift(othergroup);
			}

			this.cpvs_codes_absolute.data = codes.map((code) => {
				return {id: code.id, name: code.name, value: code.value};
			}).sort((a, b) => {
				if (a.value < b.value) {
					return -1;
				}
				if (a.value > b.value) {
					return 1;
				}
				return 0;
			});
			othergroup = null;
			othergroupcount = 0;
			while (this.cpvs_codes_absolute.data.length - 8 > 2) {
				if (!othergroup) {
					othergroup = {name: '', value: 0};
				}
				let item = this.cpvs_codes_absolute.data.shift();
				othergroup.value = item.value;
				othergroupcount++;
				othergroup.name = this.i18n.getFormat('[{{count}} other sectors with less than {{value}}]', [{key: 'count', value: othergroupcount}, {key: 'value', value: item.value}]);
			}
			if (othergroup) {
				this.cpvs_codes_absolute.data.unshift(othergroup);
			}

		}
	}

}
