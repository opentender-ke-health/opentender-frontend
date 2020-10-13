import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {IAuthority, ISeriesProvider, IStatsAuthorities} from '../../../app.interfaces';
import {IChartBar} from '../../../thirdparty/ngx-charts-universal/chart.interface';
import {Router} from '@angular/router';
import {I18NService} from '../../i18n/services/i18n.service';
import {Colors} from '../../../model/colors';
import * as Config from '../../../../../config.dist.js';

@Component({
	selector: 'graph[authorities]',
	template: `
		<div class="graph-title">
			{{title}}
			<info-button *ngIf="showTooltip">
				<p>Buyer refers to any public entity procuring goods, works, or services from private companies (suppliers).</p>
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
		<graph-footer [sender]="this"></graph-footer>`
})
export class GraphAuthoritiesComponent implements OnChanges, ISeriesProvider {
	@Input() title: string;
	@Input() data: {
		absolute: IStatsAuthorities,
		volume: IStatsAuthorities,
	};
	@Input() showTooltip = true;
	mode: string = 'nr';
	currencySymbol = Config.currencySymbol;

	authorities_absolute: IChartBar = {
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
			colorScheme: Colors.colorSchemes.ordinal_3
		},
		select: (event) => {
			this.router.navigate(['/authority/' + event.id]);
		},
		data: null
	};

	authorities_volume: IChartBar = {
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
			colorScheme: Colors.colorSchemes.ordinal_3
		},
		select: (event) => {
			if (event.id) {
				this.router.navigate(['/authority/' + event.id]);
			}
		},
		data: null
	};

	graph = this.authorities_absolute;

	constructor(private router: Router, private i18n: I18NService) {
		this.authorities_absolute.chart.xAxis.label = this.i18n.get('Nr. of Tenders');
		this.authorities_absolute.chart.yAxis.label = this.i18n.get('Buyer');
		this.authorities_absolute.chart.i18n = this.i18n.ChartsTranslations;
		this.authorities_volume.chart.xAxis.label = this.i18n.get(`Total Volume of Tenders (${this.currencySymbol})`);
		this.authorities_volume.chart.yAxis.label = this.i18n.get('Buyer');
		this.authorities_volume.chart.i18n = this.i18n.ChartsTranslations;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data) {
			this.authorities_absolute.data = null;
			this.authorities_volume.data = null;
			if (this.data) {
				let absolute: Array<IAuthority> = this.data.absolute && this.data.absolute.top10 ? this.data.absolute.top10 : [];
				this.authorities_absolute.data = absolute.filter(authority => authority.body.id).map((authority) => {
					return {id: authority.body.id, name: this.i18n.nameGuard(authority.body.name), value: authority.value};
				}).reverse();
				let volume = this.data.volume && this.data.volume.top10 ? this.data.volume.top10 : [];
				this.authorities_volume.data = volume.filter(authority => authority.body.id).map((authority) => {
					return {id: authority.body.id, name: this.i18n.nameGuard(authority.body.name), value: authority.value};
				}).reverse();
			}
		}
	}

	getSeriesInfo() {
		return {data: this.graph.data, header: {value: this.graph.chart.xAxis.label, name: 'Name'}, filename: 'buyers'};
	}

	toggleValue(mode: string) {
		this.mode = mode;
		this.displayActive();
	}

	displayActive() {
		if (this.mode === 'nr') {
			this.graph = this.authorities_absolute;
		} else if (this.mode === 'vol') {
			this.graph = this.authorities_volume;
		}
	}

}
