import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApiService} from '../../services/api.service';
import {PlatformService} from '../../services/platform.service';
import {ConfigService, Country} from '../../services/config.service';
import {NotifyService} from '../../services/notify.service';
import {Utils} from '../../model/utils';
import {I18NService} from '../../modules/i18n/services/i18n.service';
import {Subscription} from 'rxjs/Subscription';
import {IBreadcrumb, ISearchCommandFilter, ISearchFilterDefType, IStats} from '../../app.interfaces';
import {IndicatorService} from '../../services/indicator.service';

interface IState {
	open: boolean;
	empty: boolean;
	label?: string;
	subempty?: { [name: string]: boolean };
}

@Component({
	moduleId: __filename,
	selector: 'tender',
	templateUrl: 'tender.component.html',
	styleUrls: ['tender.component.scss']
})
export class TenderPage implements OnInit, OnDestroy {
	public tender: Definitions.Tender;
	public loading: number = 0;
	public notFound: boolean = false;
	private subscription: Subscription;
	public showDownloadDialog: boolean = false;
	public crumbs: Array<IBreadcrumb> = [];
	public country: Country;
	public state: {
		[name: string]: IState;
		lots: IState;
		buyer: IState;
		indi: IState;
		info: IState;
		desc: IState;
		reqs: IState;
		additional: IState;
		documents: IState;
		publications: IState;
	} = {
		lots: {open: true, empty: true},
		buyer: {open: true, empty: true},
		indi: {open: true, empty: true},
		info: {open: true, empty: true, subempty: {}},
		desc: {open: true, empty: true},
		reqs: {open: true, empty: true},
		additional: {open: true, empty: true, subempty: {}},
		documents: {open: true, empty: true},
		publications: {open: true, empty: true}
	};
	public viz = {
		indicator_groups: [],
		distribution: {
			data: null,
			highlight: {
				year: null,
				values: null
			},
			title: '',
			name: null,
			filters: []
		}
	};
	public tooltips = {
		'Integrity Indicator': [
			'The shown indicators assess the level of integrity for this contract by measuring a number of red flags that indicate a risk of low level of integrity in this procurement process. They evaluate different elements of the process of awarding contracts such as the length of the tender advertisement period, as well as key outputs such as number of bidders. The overall score shows the average of the individual Integrity Indicators for this contract. For example, an average score of 40 means that only 40% of the key integrity dimensions showed no risks (covered by the individual integrity indicators) based on all contracts awarded during the selected time period.',
			'For further details see the Data Explainer on the About page.'
		],
		'Transparency Indicator': [
			'The shown indicators assess the level of transparency for this contract by measuring the share of crucial pieces of information available. The overall score shows the average of the individual Transparency Indicators for this contract, each of which stands for one key piece of information that should be published for transparent public procurement.'
		],
	};

	constructor(private route: ActivatedRoute, private api: ApiService, private config: ConfigService, private platform: PlatformService,
				private notify: NotifyService, private i18n: I18NService, private indicators: IndicatorService) {
		if (!this.platform.isBrowser) {
			this.state.additional.open = true;
			this.state.documents.open = true;
			this.state.publications.open = true;
			this.state.reqs.open = true;
		}
		this.viz.distribution.title = i18n.get('Benchmark Current Tender');
		this.state.lots.label = this.i18n.get('Lots');
		this.state.buyer.label = this.i18n.get('Buyer');
		this.state.indi.label = this.i18n.get('Indicators');
		this.state.info.label = this.i18n.get('Tender Information');
		this.state.desc.label = this.i18n.get('Description');
		this.state.reqs.label = this.i18n.get('Requirements');
		this.state.additional.label = this.i18n.get('Additional Information');
		this.state.documents.label = this.i18n.get('Documents');
		this.state.publications.label = this.i18n.get('Publications');
		this.country = config.country;
		this.buildCrumbs();
	}

	public buildCrumbs(): void {
		this.crumbs = [
			{
				name: this.i18n.get('Tenders'),
				link: '/search/tender'
			}
		];
		if (this.tender) {
			this.crumbs.push({
				name: this.i18n.get('Tender')
			});
		}
	}

	getLotCollapse(lot, index) {
		let result = (this.state['lot' + index]);
		if (!result) {
			result = {
				open: !this.platform.isBrowser,
				label: this.i18n.get('Lot') + ' ' + (index + 1),
				empty: false
			};
			this.state['lot' + index] = result;
		}
		return result;
	}

	ngOnInit(): void {
		this.subscription = this.route.params.subscribe(params => {
			let id = params['id'];
			this.loading++;
			this.notFound = false;
			let sub = this.api.getTender(id).subscribe(
				(result) => this.display(result.data),
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
		this.subscription.unsubscribe();
	}

	objHasProperty(obj: any, propNames: Array<string>): boolean {
		if (!obj) {
			return false;
		}
		return !!propNames.find(name => Utils.isDefined(obj[name]));
	}

	display(tender: Definitions.Tender): void {
		this.tender = null;
		if (tender) {
			this.tender = tender;
			this.state.reqs.empty = !this.objHasProperty(tender, ['personalRequirements', 'economicRequirements', 'technicalRequirements', 'eligibilityCriteria', 'deposits']);
			this.state.buyer.empty = !this.objHasProperty(tender, ['buyers', 'onBehalfOf', 'furtherInformationProvider', 'specificationsProvider', 'bidsRecipient', 'appealBodyName', 'mediationBodyName', 'administrators']);
			this.state.lots.empty = !Utils.isDefined(tender.lots);
			this.state.publications.empty = !Utils.isDefined(tender.publications);
			this.state.documents.empty = !Utils.isDefined(tender.documents);
			this.state.info.subempty['types'] = !this.objHasProperty(tender, ['supplyType', 'procedureType', 'selectionMethod', 'eligibleBidLanguages', 'maxBidsCount', 'maxFrameworkAgreementParticipants', 'awardCriteria']);
			this.state.info.subempty['prices'] = !this.objHasProperty(tender, ['estimatedPrice', 'finalPrice', 'documentsPrice']);
			this.state.info.subempty['dates'] = !this.objHasProperty(tender, ['estimatedStartDate', 'estimatedCompletionDate', 'bidDeadline', 'documentsDeadline', 'estimatedDurationInDays', 'estimatedDurationInMonths', 'estimatedDurationInYears']);
			this.state.info.subempty['cpvs'] = !Utils.isDefined(tender.cpvs);
			this.state.info.subempty['first-column'] = this.state.info.subempty['prices'] && this.state.info.subempty['dates'] && this.state.info.subempty['cpvs'];
			this.state.info.empty = this.state.info.subempty['first-column'] && this.state.info.subempty['types'];
			this.state.additional.subempty['fundings'] = !Utils.isDefined(tender.fundings);
			this.state.additional.subempty['tender'] =
				!this.objHasProperty(tender, ['isEInvoiceAccepted', 'isCentralProcurement', 'isCoveredByGpa', 'isFrameworkAgreement', 'isJointProcurement', 'isDps', 'isElectronicAuction',
					'hasLots', 'hasOptions', 'areVariantsAccepted', 'buyerAssignedId']);
			let vals = {};
			let scores = {};
			let indicators = {};
			if (tender.indicators) {
				tender.indicators.forEach(indicator => {
					if (indicator.status === 'CALCULATED') {
						vals[indicator.type] = indicator.value;
						const ig = this.indicators.getGroupOf(indicator.type);
						const ii = this.indicators.getIndicatorInfo(indicator.type);
						if (ig && ii) {
							indicators[ig.id] = indicators[ig.id] || [];
							indicators[ig.id].push({id: indicator.type, name: ii.name, value: indicator.value});
						}
					}
				});
			}
			if (tender.ot.scores) {
				tender.ot.scores.forEach(score => {
					if (score.status === 'CALCULATED') {
						vals[score.type] = score.value;
						const ig = score.type == 'TENDER' ? this.indicators.TENDER : this.indicators.getGroupOf(score.type);
						if (ig) {
							scores[ig.id] = scores[ig.id] || [];
							scores[ig.id].push({id: score.type, name: ig.name, value: score.value});
						}
					}
				});
			}
			this.viz.indicator_groups = this.indicators.GROUPS.map(g => {
				return {
					title: g.name,
					scores: scores[g.id] || [],
					indicators: indicators[g.id] || []
				};
			});
			this.viz.distribution.highlight.values = vals;
			if (tender.ot.date) {
				this.viz.distribution.highlight.year = tender.ot.date.slice(0, 4);
			}
			this.buildBenchmarkFilter();
			this.refresh();
		}
		this.buildCrumbs();
	}

	buildBenchmarkFilter() {
		this.viz.distribution.filters = [];
		if (this.tender.ot.cpv) {
			this.viz.distribution.filters.push({id: 'cpv', name: this.i18n.get('Limit to same sector'), active: false});
		}
		if (this.tender.buyers && this.tender.buyers.length > 0 && this.tender.buyers[0].address && this.tender.buyers[0].address.ot && this.tender.buyers[0].address.ot.nutscode) {
			this.viz.distribution.filters.push({id: 'nuts', name: this.i18n.get('Limit to same region (Parish)'), active: false, data: this.tender.buyers[0].address.ot.nutscode});
		}
		if (this.tender.ot.date) {
			this.viz.distribution.filters.push({id: 'years', name: this.i18n.get('Show all years'), active: false});
		}
	}

	refresh(): void {
		if (!this.tender) {
			return;
		}
		let filters: Array<ISearchCommandFilter> = this.viz.distribution.filters.filter(f => f.active).map(f => {
			if (f.id === 'nuts') {
				let level = 3;
				return {
					field: 'buyers.address.ot.nutscode.nuts' + level,
					type: ISearchFilterDefType[ISearchFilterDefType.term],
					value: [f.data.slice(0, 2 + level)]
				};
			} else if (f.id === 'cpv') {
				return {
					field: 'ot.cpv.divisions',
					type: ISearchFilterDefType[ISearchFilterDefType.term],
					value: [this.tender.ot.cpv.slice(0, 2)]
				};
			} else {
				return null;
			}
		}).filter(f => f !== null);
		let sub = this.api.getTenderStats({ids: [this.tender.id], filters: filters}).subscribe(
			(result) => this.displayStats(result.data),
			(error) => {
				this.notify.error(error);
			},
			() => {
				sub.unsubscribe();
			});
	}

	displayStats(data: { stats: IStats }): void {
		let viz = this.viz;
		viz.distribution.data = null;
		if (!data || !data.stats) {
			return;
		}
		let stats = data.stats;
		let showYears = this.viz.distribution.filters.find(f => f.id === 'years');
		if (!this.tender.ot.date || (showYears && showYears.active)) {
			viz.distribution.data = stats.histogram_distribution_indicators;
		} else {
			let limited = {};
			let year = this.tender.ot.date.slice(0, 4);
			Object.keys(stats.histogram_distribution_indicators).forEach(key => {
				let group = stats.histogram_distribution_indicators[key];
				if (group[year]) {
					limited[key] = {};
					limited[key][year] = group[year];
				}
			});
			viz.distribution.data = limited;
		}
	}

	benchmarkFilterChange(event) {
		this.refresh();
	}

	getTenderJSONString(): string {
		return JSON.stringify(this.tender, null, '\t');
	}

	download(format): void {
		Utils.downloadJSON(this.tender, 'tender-' + this.tender.id);
	}

}
