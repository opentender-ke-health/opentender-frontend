import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IChartTreeMap} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {ISector, ISeriesProvider, IStats} from '../../../app.interfaces';
import {Router} from '@angular/router';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';
import * as Config from '../../../../../config.dist.js';

@Component({
	selector: 'graph[sector-treemap]',
	template: `
		<div class="graph-header">
			<div class="graph-title">
				{{title}}
				<info-button>
					<p>The size of different sectors can be displayed in terms of monetary value or the number of tenders. Click on the tiles to get sector-specific statistics.<br>
						Contracts are categorized into product markets (CPV codes) based on the tender description. See more on the details of contract categorization and the CPV nomenclature in the Data Explainer on the About page.</p>
				</info-button>
			</div>
			<div class="graph-toolbar-container">
				<div class="graph-toolbar">
					<button class="tool-button" [ngClass]="{down:this.graph==this.cpv_codes_prices}" (click)="this.graph=this.cpv_codes_prices" i18n>Volume ({{currencySymbol}})</button>
					<button class="tool-button" [ngClass]="{down:this.graph==this.cpv_codes_nr}" (click)="this.graph=this.cpv_codes_nr" i18n>Nr. of Tenders</button>
				</div>
			</div>
		</div>
		<ngx-charts-tree-map
				class="chart-container"
				[chart]="graph.chart"
				[data]=" graph.data"
				(select)="graph.select($event)">
		</ngx-charts-tree-map>
		<graph-footer [sender]="this" ></graph-footer>`
})
export class GraphSectorTreeMap implements OnChanges, ISeriesProvider {
	@Input() title: string;
	@Input() data: Array<{ sector: ISector; stats: IStats }>;
	currencySymbol = Config.currencySymbol;

	cpv_codes_nr: IChartTreeMap = {
		chart: {
			view: {
				def: {width: 1024, height: 400},
				min: {height: 400},
				max: {height: 400}
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatValue(value);
			},
			colorScheme: Colors.colorSchemes.ordinal_cpvs
		},
		select: (event) => {
			this.router.navigate(['/sector/' + event.id]);
		},
		data: null
	};

	cpv_codes_prices: IChartTreeMap = {
		chart: {
			view: {
				def: {width: 1024, height: 400},
				min: {height: 400},
				max: {height: 400}
			},
			valueFormatting: (n: number): string => {
				return this.i18n.formatCurrencyValueEUR(n);
			},
			colorScheme: Colors.colorSchemes.ordinal_cpvs
		},
		select: (event) => {
			this.router.navigate(['/sector/' + event.id]);
		},
		data: null
	};

	graph: IChartTreeMap = this.cpv_codes_prices;

	constructor(private router: Router, private i18n: I18NService) {
		this.cpv_codes_nr.chart.legend = {title: i18n.get('Nr. of Tenders')};
		this.cpv_codes_prices.chart.legend = {title: i18n.get(`Volume of Tenders (${this.currencySymbol})`)};
		this.cpv_codes_nr.chart.i18n = this.i18n.ChartsTranslations;
		this.cpv_codes_prices.chart.i18n = this.i18n.ChartsTranslations;
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.legend.title, name: 'CPV Name', id: 'CPV Nr.'}, filename: 'subsector-overview'};
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.cpv_codes_nr.data = null;
			this.cpv_codes_prices.data = null;
			if (this.data) {
				this.cpv_codes_nr.data = this.data.filter(s => s.sector.value > 0).map(s => {
					return {name: s.sector.name, value: s.sector.value, id: s.sector.id};
				});
				this.cpv_codes_prices.data = this.data.filter(s => !isNaN(s.stats.sum_finalPriceEUR.value) && s.stats.sum_finalPriceEUR.value > 0).map(s => {
					return {name: s.sector.name, value: s.stats.sum_finalPriceEUR.value, id: s.sector.id};
				});
			}
		}
	}

}
