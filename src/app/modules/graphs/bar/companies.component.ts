import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ICompany, ISeriesProvider, IStatsCompanies} from '../../../app.interfaces';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {Router} from '@angular/router';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';
import * as Config from '../../../../../config.dist.js';


@Component({
	selector: 'graph[companies]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button *ngIf="showTooltip">
				<p>Supplier refers to any company providing goods, works, or services to a public entity (a buyer).</p>
			</info-button>
		</div>
		<div class="graph-toolbar-container">
			<div class="graph-toolbar graph-toolbar-left">
				<button class="tool-button" [ngClass]="{down:mode==='nr'}" (click)="toggleValue('nr')" i18n>Number of tenders</button>
				<button class="tool-button" [ngClass]="{down:mode==='vol'}" (click)="toggleValue('vol')" i18n>Volume ({{currencySymbol}})</button>
			</div>
		</div>
		<ngx-charts-bar-horizontal-labeled
				class="chart-container"
				[chart]="graph.chart"
				[data]="graph.data"
				(select)="graph.select($event)">
		</ngx-charts-bar-horizontal-labeled>
		<graph-footer [sender]="this"></graph-footer>
	`
})
export class GraphCompaniesComponent implements OnChanges, ISeriesProvider {
	@Input() title: string;
	@Input() data: {
		absolute: IStatsCompanies,
		volume: IStatsCompanies,
	};
	@Input() showTooltip = true;
	mode: string = 'nr';
	currencySymbol = Config.currencySymbol;

	companies_absolute: IChartBar = {
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
			colorScheme: Colors.colorSchemes.ordinal_4
		},
		select: (event) => {
			this.router.navigate(['/company/' + event.id]);
		},
		data: null
	};

	companies_volume: IChartBar = {
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
				tickFormatting: (value: number) => {
					return this.i18n.formatCurrencyValue(<number>value);
				}
			},
			yAxis: {
				show: false,
				showLabel: true,
				defaultWidth: 150,
				maxLength: 24,
			},
			valueFormatting: (value: number) => {
				return this.i18n.formatCurrencyValueEUR(<number>value);
			},
			showGridLines: true,
			gradient: false,
			colorScheme: Colors.colorSchemes.ordinal_4
		},
		select: (event) => {
			this.router.navigate(['/company/' + event.id]);
		},
		data: null
	};

	graph = this.companies_absolute;

	constructor(private router: Router, private i18n: I18NService) {
		this.companies_absolute.chart.xAxis.label = this.i18n.get('Nr. of Tenders');
		this.companies_absolute.chart.yAxis.label = this.i18n.get('Supplier');
		this.companies_volume.chart.xAxis.label = this.i18n.get(`Total Volume of Tenders (${this.currencySymbol})`);
		this.companies_volume.chart.yAxis.label = this.i18n.get('Supplier');
		this.companies_absolute.chart.i18n = this.i18n.ChartsTranslations;
		this.companies_volume.chart.i18n = this.i18n.ChartsTranslations;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.companies_absolute.data = null;
			this.companies_volume.data = null;
			if (this.data) {
				let companies: Array<ICompany> = this.data.absolute && this.data.absolute.top10 ? this.data.absolute.top10 : [];
				this.companies_absolute.data = companies.filter(company => company.body.id).map((company) => {
					return {id: company.body.id, name: this.i18n.nameGuard(company.body.name), value: company.value};
				}).reverse();

				companies = this.data.volume && this.data.volume.top10 ? this.data.volume.top10 : [];
				this.companies_volume.data = companies.filter(company => company.body.id).map((company) => {
					return {id: company.body.id, name: this.i18n.nameGuard(company.body.name), value: company.value};
				}).reverse();
			}
		}
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.xAxis.label, name: this.i18n.get('Name')}, filename: 'suppliers'};
	}

	toggleValue(mode: string) {
		this.mode = mode;
		this.displayActive();
	}

	displayActive() {
		if (this.mode === 'nr') {
			this.graph = this.companies_absolute;
		} else if (this.mode === 'vol') {
			this.graph = this.companies_volume;
		}
	}
}
