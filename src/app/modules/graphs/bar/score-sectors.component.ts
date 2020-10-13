import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Utils} from '../../../model/utils';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISeriesProvider, IStatsCpvs} from '../../../app.interfaces';
import {Router} from '@angular/router';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';

@Component({
	selector: 'graph[score-sectors]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button>
				<p *ngFor="let text of tooltipTexts">{{text}}</p>
			</info-button>
		</div>
		<div class="graph-toolbar-container"></div>
		<ngx-charts-bar-horizontal-labeled
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data"
				(select)="graph.select($event)">
		</ngx-charts-bar-horizontal-labeled>
		<graph-footer [sender]="this" ></graph-footer>`
})
export class GraphScoreSectorsComponent implements OnChanges, ISeriesProvider {
	@Input()
	data: IStatsCpvs;
	@Input()
	title: string = '';
	@Input() tooltipTexts = [''];

	cpvs_codes_scores: IChartBar = {
		chart: {
			view: {
				def: {width: 500, height: 360},
				min: {height: 360},
				max: {height: 360}
			},
			xAxis: {
				show: true,
				showLabel: true,
				minInterval: 0.1,
				defaultHeight: 20,
				tickFormatting: (value: number) => {
					return this.i18n.formatValue(value);
				}
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
			colorScheme: Colors.colorSchemes.linear_red_green
		},
		select: (event) => {
			if (event.id) {
				this.router.navigate(['/sector/' + event.id]);
			}
		},
		data: null
	};

	graph: IChartBar = this.cpvs_codes_scores;

	constructor(private router: Router, private i18n: I18NService) {
		this.title = this.i18n.get('Sectors');
		this.cpvs_codes_scores.chart.xAxis.label = this.i18n.get('Average Score');
		this.cpvs_codes_scores.chart.yAxis.label = this.i18n.get('Sector (CPV)');
		this.cpvs_codes_scores.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		let series = Object.keys(this.data).map((key) => {
			return {id: key, name: this.data[key].name, value: this.data[key].value};
		});
		return {data: series, header: {value: this.graph.chart.xAxis.label, name: 'CPV Name', id: 'CPV Nr.'}, filename: 'sectors'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.cpvs_codes_scores.data = null;
			if (this.data) {
				this.cpvs_codes_scores.data = Object.keys(this.data).map((key) => {
					return {id: key, name: this.data[key].name, value: this.data[key].value};
				});
				this.cpvs_codes_scores.data.sort((a, b) => {
					if (a.value > b.value) {
						return 1;
					}
					if (a.value < b.value) {
						return -1;
					}
					return 0;
				});
				let othergroup;
				let othergroupcount = 0;
				while (this.cpvs_codes_scores.data.length - 8 > 2) {
					if (!othergroup) {
						othergroup = {name: '', value: 0};
					}
					let item = this.cpvs_codes_scores.data.shift();
					othergroup.value = Math.max(item.value, othergroup.value);
					othergroupcount++;
					othergroup.name = this.i18n.getFormat('[{{count}} other sectors with less than {{value}}]', [{key: 'count', value: othergroupcount}, {key: 'value', value: Utils.roundValueTwoDecimals(item.value)}]);
				}
				if (othergroup) {
					this.cpvs_codes_scores.data.unshift(othergroup);
				}
			}
		}
	}

}
