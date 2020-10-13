import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {NotifyService} from '../../../services/notify.service';
import {ISector, IStats, IStatsNuts, ISearchCommandFilter, IStatsInYears, IStatsCpvs, IStatsPricesInYears, IStatsProcedureType, IStatsAuthorities, IStatsCompanies} from '../../../app.interfaces';
import {I18NService} from '../../../modules/i18n/services/i18n.service';
import * as Config from '../../../../../config.dist.js';

@Component({
	moduleId: __filename,
	selector: 'market-analysis',
	templateUrl: 'market-analysis.component.html'
})
export class DashboardsMarketAnalysisPage implements OnInit, OnDestroy {
	public sectors_stats: Array<{ sector: ISector, stats: IStats }> = [];
	public loading: number = 0;
	public viz: {
		score_in_years: { data: IStatsInYears, title?: string };
		score_in_sectors: { data: IStatsCpvs, title?: string };
		procedure_types: { data: IStatsProcedureType, title?: string };
		lots_in_years: { data: IStatsPricesInYears, title?: string };
		top_authorities: { data: { absolute: IStatsAuthorities, volume: IStatsAuthorities }, title?: string };
		top_companies: { data: { absolute: IStatsCompanies, volume: IStatsCompanies }, title?: string };
		sectors_stats: { data: Array<{ sector: ISector; stats: IStats }>, title?: string };
		volume_regions: { data: IStatsNuts, title?: string };
		years: { data: Array<number>, title?: string };
	} = {
		sectors_stats: {data: null},
		volume_regions: {data: null},
		score_in_sectors: {data: null},
		score_in_years: {data: null},
		procedure_types: {data: null},
		lots_in_years: {data: null},
		top_authorities: {data: null},
		top_companies: {data: null},
		years: {data: null},
	};
	public filter: {
		years?: { startValue: number, endValue: number };
	} = {};
	currencySymbol = Config.currencySymbol;
	@ViewChild('tableWrap') private tableWrap: ElementRef;
	public tableHeadingCord = '0';
	get headingTransform() {
		return {
			'transform': `translateY(${this.tableHeadingCord})`
		};
	}
	constructor(private api: ApiService, private i18n: I18NService, private notify: NotifyService) {
		this.viz.score_in_years.title = i18n.get('Average Good Procurement Score over Time');
		this.viz.score_in_sectors.title = i18n.get('Average Good Procurement Score per Sector');
		this.viz.sectors_stats.title = i18n.get('Sector Overview');
		this.viz.top_authorities.title = i18n.get('Main Buyers');
		this.viz.top_companies.title = i18n.get('Main Suppliers');
		this.viz.procedure_types.title = i18n.get('Tenders per procedure type');
		this.viz.lots_in_years.title = i18n.get('Tenders over Time');
	}

	public onYearRangeSliderChange(event): void {
		if (!this.viz.years.data) {
			return;
		}
		this.filter.years = event.data;
		this.visualize();
	}

	private visualize() {
		let filters = this.buildFilters();
		this.loading++;
		let sub = this.api.getMarketAnalysisStats({filters: filters}).subscribe(
			(result) => {
				this.displayStats(result.data);
			},
			(error) => {
				this.notify.error(error);
			},
			() => {
				this.loading--;
				sub.unsubscribe();
			});
	}

	public ngOnInit(): void {
		this.visualize();
	}
	ngAfterViewInit() {
		window.addEventListener('scroll', () => {
			this.watchToTableHeading();
		});
	}

	public ngOnDestroy(): void {
	}

	private buildFilters(): Array<ISearchCommandFilter> {
		let filters = [];
		if (this.filter.years) {
			let yearFilter: ISearchCommandFilter = {
				field: 'ot.date',
				type: 'years',
				value: [this.filter.years.startValue, this.filter.years.endValue + 1]
			};
			filters.push(yearFilter);
		}
		return filters;
	}

	private displayStats(stats: IStats): void {
		this.sectors_stats = [];
		let viz = this.viz;
		Object.keys(viz).forEach(key => {
			viz[key].data = null;
		});
		if (!stats) {
			return;
		}
		this.sectors_stats = stats.sectors_stats;
		viz.sectors_stats.data = stats.sectors_stats;
		viz.volume_regions.data = {};
		stats.region_stats.forEach(region => {
			viz.volume_regions.data[region.id] = region.stats.sum_finalPriceEUR.value || 0;
		});
		viz.score_in_years.data = stats.histogram_indicators['TENDER'] || {};
		viz.score_in_sectors.data = stats.terms_main_cpv_divisions_score;
		viz.lots_in_years.data = stats.histogram_finalPriceEUR;
		viz.procedure_types.data = stats.terms_procedure_type;
		viz.top_companies.data = {absolute: stats.top_terms_companies, volume: stats.top_sum_finalPrice_companies};
		viz.top_authorities.data = {absolute: stats.top_terms_authorities, volume: stats.top_sum_finalPrice_authorities};
		viz.years.data = Object.keys(stats.histogram || {}).map(key => parseInt(key, 10));
	}
	get fixedTableHeadingConditional(): boolean {
		let rect = this.tableWrap.nativeElement.getBoundingClientRect();
		let elemHeight = rect.bottom - rect.top;
		let screenHeight = window.innerHeight;
		return (
			screenHeight < elemHeight
			&& rect.top < 0
			&& rect.bottom > 300
		);
	}
	private watchToTableHeading(): void {
		if (this.fixedTableHeadingConditional) {
			let rect = this.tableWrap.nativeElement.getBoundingClientRect();
			this.tableHeadingCord = `${rect.top * -1}px`;
		} else {
			this.tableHeadingCord = `0px`;
		}
	}

}
