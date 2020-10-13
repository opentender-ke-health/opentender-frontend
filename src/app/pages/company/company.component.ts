import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {TitleService} from '../../services/title.service';
import {StateService} from '../../services/state.service';
import {ConfigService, Country} from '../../services/config.service';
import {IStats, ICompany, IStatsCpvs, ISearchCommand, IStatsAuthorities, IStatsNuts, IStatsPricesInYears, IBenchmarkFilter, ISearchCommandFilter, ISearchFilterDefType, IBreadcrumb} from '../../app.interfaces';
import {NotifyService} from '../../services/notify.service';
import {REGION_BENCHMARK} from '../../model/gradLegend';

/// <reference path="./model/tender.d.ts" />
import Body = Definitions.Body;
import {I18NService} from '../../modules/i18n/services/i18n.service';

@Component({
	moduleId: __filename,
	selector: 'company',
	templateUrl: 'company.component.html'
})
export class CompanyPage implements OnInit, OnDestroy {
	public company: Body;
	public country: Country;
	public search_cmd: ISearchCommand;
	public columnIds = ['id', 'title', 'titleEnglish', 'buyers.name', 'finalPrice'];
	public defaultColumns = ['id', 'title', 'titleEnglish', 'buyers.name', 'finalPrice'];
	public crumbs: Array<IBreadcrumb> = [];
	public similar: Array<Body> = [];
	public include_companies_ids: Array<string> = [];
	public loading: number = 0;
	public notFound: boolean = false;
	private subscription: any;
	public REGION_BENCHMARK = REGION_BENCHMARK;

	public viz: {
		authority_nuts: { data: IStatsNuts, title?: string };
		top_authorities: { data: { absolute: IStatsAuthorities, volume: IStatsAuthorities }, title?: string };
		cpvs_codes: { data: IStatsCpvs, title?: string };
		lots_in_years: { data: IStatsPricesInYears, title?: string };
		stats: { data: IStats, title?: string, filters?: Array<IBenchmarkFilter> };
	} = {
		authority_nuts: {data: null},
		top_authorities: {data: null},
		cpvs_codes: {data: null},
		lots_in_years: {data: null},
		stats: {data: null, filters: []}
	};

	constructor(private route: ActivatedRoute, private api: ApiService, private titleService: TitleService,
				private state: StateService, private i18n: I18NService, private config: ConfigService, private notify: NotifyService) {
		this.country = config.country;
		this.viz.top_authorities.title = i18n.get('Main Buyers');
		this.viz.stats.title = i18n.get('Benchmark Current Supplier');
		this.buildCrumbs();
	}

	ngOnInit(): void {
		let state = this.state.get('company');
		if (state) {
			this.columnIds = state.columnIds;
		}
		this.subscription = this.route.params.subscribe(params => {
			let id = params['id'];
			this.loading++;
			this.notFound = false;
			let sub = this.api.getCompany(id).subscribe(
				result => {
					this.display(result.data);
				},
				error => {
					this.display(null);
					if (error.status == 404) {
						this.notFound = true;
					} else {
						this.notify.error(error);
					}
				},
				() => {
					this.loading--;
					sub.unsubscribe();
				});
		});
	}

	ngOnDestroy() {
		this.state.put('company', {
			columnIds: this.columnIds
		});
		this.subscription.unsubscribe();
	}

	public buildCrumbs(): void {
		this.crumbs = [
			{
				name: this.i18n.get('Companies')
			}];
		if (this.company) {
			this.crumbs.push({
				name: this.i18n.nameGuard(this.company.name)
			});
		}
	}

	benchmarkFilterChange(event) {
		let ids = this.getCurrentIds();
		this.getStats(ids);
	}

	buildBenchmarkFilter() {
		let active = {};
		this.viz.stats.filters.forEach(f => {
			active[f.id] = f.active;
		});
		this.viz.stats.filters = [];
		if (this.viz.cpvs_codes.data) {
			let max_cpv: string;
			Object.keys(this.viz.cpvs_codes.data).forEach(cpv => {
				max_cpv = !max_cpv || this.viz.cpvs_codes.data[cpv].value > this.viz.cpvs_codes.data[max_cpv].value ? cpv : max_cpv;
			});
			if (max_cpv) {
				this.viz.stats.filters.push({id: 'sector', name: this.i18n.get('Limit to same sector'), active: active['sector'], data: max_cpv});
			}
		}
	}

	getStats(ids: Array<string>) {
		let filters: Array<ISearchCommandFilter> = this.viz.stats.filters.filter(f => f.active).map(f => {
			if (f.id === 'sector') {
				return {
					field: 'ot.cpv.divisions', type: ISearchFilterDefType[ISearchFilterDefType.term], value: [f.data]
				};
			}
		});
		this.loading++;
		let sub = this.api.getCompanyStats({ids, filters}).subscribe(
			result => {
				this.displayStats(result.data);
			},
			error => {
				this.notify.error(error);
			},
			() => {
				this.loading--;
				sub.unsubscribe();
			});
	}

	getSimilars(id: string) {
		this.loading++;
		let sub = this.api.getCompanySimilar(id).subscribe(
			result => {
				this.displaySimilar(result.data);
			},
			error => {
				this.notify.error(error);
			},
			() => {
				this.loading--;
				sub.unsubscribe();
			});
	}

	display(data: { company: ICompany }): void {
		if (data && data.company && data.company.body) {
			this.company = data.company.body;
			this.buildBenchmarkFilter();
			this.titleService.set(this.company.name);
			this.getSimilars(this.company.id);
			this.refresh();
		} else {
			this.company = null;
			this.titleService.setDefault();
		}
		this.buildCrumbs();
	}

	getCurrentIds(): Array<string> {
		return [this.company.id].concat(this.include_companies_ids);
	}

	refresh(): void {
		if (!this.company) {
			return;
		}
		let ids = this.getCurrentIds();
		this.getStats(ids);
		this.search(ids);
	}

	search(ids: Array<string>) {
		this.search_cmd = {
			filters: [
				{
					field: 'lots.bids.bidders.id',
					type: 'term',
					value: ids
				}
			]
		};
	}

	displaySimilar(data: { similar: Array<ICompany> }): void {
		if (!data || !data.similar) {
			return;
		}
		this.similar = data.similar.map(company => company.body);
	}

	displayStats(data: { stats: IStats }): void {
		let viz = this.viz;
		Object.keys(viz).forEach(key => {
			viz[key].data = null;
		});
		if (!data || !data.stats) {
			return;
		}
		let stats = data.stats;
		viz.stats.data = stats;
		viz.lots_in_years.data = stats.histogram_finalPriceEUR;
		viz.cpvs_codes.data = stats.terms_main_cpv_divisions;
		viz.top_authorities.data = {absolute: stats.top_terms_authorities, volume: stats.top_sum_finalPrice_authorities};
		viz.authority_nuts.data = stats.terms_authority_nuts;
		this.buildBenchmarkFilter();
	}

	similarChange(data) {
		this.include_companies_ids = data.value;
		this.refresh();
	}

	searchChange(data) {
	}
	public updateColumns(item) {
		this.columnIds = item.columns;
	}

	public setDefaultColumns() {
		this.columnIds = this.defaultColumns;
	}
}
