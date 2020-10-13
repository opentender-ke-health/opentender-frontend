import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {TitleService} from '../../services/title.service';
import {StateService} from '../../services/state.service';
import {IAuthority, IStats, IStatsCompanies, IStatsCpvs, ISearchCommand, IStatsNuts, IStatsPricesInYears, IBenchmarkFilter, ISearchFilterDefType, ISearchCommandFilter, IBreadcrumb} from '../../app.interfaces';
import {ConfigService, Country} from '../../services/config.service';
import {NotifyService} from '../../services/notify.service';
import {REGION_BENCHMARK} from '../../model/gradLegend';

/// <reference path="./model/tender.d.ts" />
import Buyer = Definitions.Buyer;
import {I18NService} from '../../modules/i18n/services/i18n.service';

@Component({
	moduleId: __filename,
	selector: 'authority',
	templateUrl: 'authority.component.html'
})
export class AuthorityPage implements OnInit, OnDestroy {
	public authority: Buyer;
	public crumbs: Array<IBreadcrumb> = [];
	public country: Country;
	public loading: number = 0;
	public notFound: boolean = false;
	public search_cmd: ISearchCommand;
	public columnIds = ['id', 'title', 'titleEnglish', 'lots.bids.bidders.name', 'finalPrice'];
	public defaultColumns = ['id', 'title', 'titleEnglish', 'lots.bids.bidders.name', 'finalPrice'];
	private subscription: any;
	private include_authorities_ids: Array<string> = [];
	public similar: Array<Body> = [];

	public viz: {
		top_companies: { data: { absolute: IStatsCompanies, volume: IStatsCompanies }, title?: string };
		cpvs_codes: { data: IStatsCpvs, title?: string };
		company_nuts: { data: IStatsNuts, title?: string };
		lots_in_years: { data: IStatsPricesInYears, title?: string };
		stats: { data: IStats, title?: string, filters?: Array<IBenchmarkFilter> };
	} = {
		top_companies: {data: null},
		cpvs_codes: {data: null},
		company_nuts: {data: null},
		lots_in_years: {data: null},
		stats: {
			data: null, filters: []
		}
	};
	public REGION_BENCHMARK = REGION_BENCHMARK;

	constructor(private route: ActivatedRoute, private api: ApiService, private titleService: TitleService,
				private state: StateService, private i18n: I18NService, private config: ConfigService, private notify: NotifyService) {
		this.country = config.country;
		this.viz.top_companies.title = i18n.get('Main Suppliers');
		this.viz.stats.title = i18n.get('Benchmark Current Buyer');
		this.buildCrumbs();
	}

	public buildCrumbs(): void {
		this.crumbs = [
			{
				name: this.i18n.get('Authorities')
			}];
		if (this.authority) {
			this.crumbs.push({
				name: this.i18n.nameGuard(this.authority.name)
			});
		}
	}

	ngOnInit(): void {
		let state = this.state.get('authority');
		if (state) {
			this.columnIds = state.columnIds;
		}
		this.notFound = false;
		this.subscription = this.route.params.subscribe(params => {
			let id = params['id'];
			this.loading++;
			let sub = this.api.getAuthority(id).subscribe(
				(result) => {
					this.display(result.data);
				},
				(error) => {
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
		this.state.put('authority', {
			columnIds: this.columnIds
		});
		this.subscription.unsubscribe();
	}

	buildBenchmarkFilter() {
		this.viz.stats.filters = [];
		if (this.authority.buyerType) {
			this.viz.stats.filters.push({id: 'buyerType', name: this.i18n.get('Limit to same Buyer Type'), active: true});
		}
		if (this.authority.mainActivities && this.authority.mainActivities.length > 0) {
			this.viz.stats.filters.push({id: 'mainActivities', name: this.i18n.get('Limit to same Main Activities'), active: false});
		}
	}

	display(data: { authority: IAuthority }): void {
		if (data && data.authority) {
			this.authority = data.authority.body;
			this.buildBenchmarkFilter();
			this.titleService.set(this.authority.name);
			this.getSimilars(this.authority.id);
			this.refresh();
		} else {
			this.authority = null;
			this.titleService.setDefault();
		}
		this.buildCrumbs();
	}

	benchmarkFilterChange(event) {
		let ids = this.getCurrentIds();
		this.getStats(ids);
	}

	getStats(ids: Array<string>) {
		let filters: Array<ISearchCommandFilter> = this.viz.stats.filters.filter(f => f.active).map(f => {
			if (f.id === 'buyerType') {
				return {field: 'buyers.buyerType', type: ISearchFilterDefType[ISearchFilterDefType.term], value: [this.authority.buyerType]};
			} else if (f.id === 'mainActivities') {
				return {field: 'buyers.mainActivities', type: ISearchFilterDefType[ISearchFilterDefType.term], value: this.authority.mainActivities};
			}
		});
		this.loading++;
		let sub = this.api.getAuthorityStats({ids, filters}).subscribe(
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

	getSimilars(id: string) {
		this.loading++;
		let sub = this.api.getAuthoritySimilar(id).subscribe(
			result => this.displaySimilar(result.data),
			error => {
				this.notify.error(error);
			},
			() => {
				this.loading--;
				sub.unsubscribe();
			});
	}

	displaySimilar(data: {
		similar: Array<IAuthority>
	}): void {
		if (!
				data.similar
		) {
			return;
		}
		this.similar = data.similar.map(authority => <Body>authority.body);
	}

	getCurrentIds(): Array<string> {
		return [this.authority.id].concat(this.include_authorities_ids);
	}

	refresh(): void {
		if (!
				this.authority
		) {
			return;
		}
		let ids = this.getCurrentIds();
		this.getStats(ids);
		this.search(ids);
	}

	displayStats(data: {
		stats: IStats
	}): void {
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
		viz.top_companies.data = {absolute: stats.top_terms_companies, volume: stats.top_sum_finalPrice_companies};
		viz.company_nuts.data = stats.terms_company_nuts;
	}

	search(ids: Array<string>) {
		this.search_cmd = {
			filters: [
				{
					field: 'buyers.id',
					type: 'term',
					value: ids
				}
			]
		};
	}

	similarChange(data) {
		this.include_authorities_ids = data.value;
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
