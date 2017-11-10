import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {NotifyService} from '../../../services/notify.service';
import {ISector, IStats, IStatsNuts, ISearchCommandFilter, IStatsInYears, IStatsCpvs} from '../../../app.interfaces';

@Component({
	moduleId: __filename,
	selector: 'market-analysis',
	templateUrl: 'market-analysis.template.html'
})
export class DashboardsMarketAnalysisPage implements OnInit, OnDestroy {
	public sectors_stats: Array<{ sector: ISector, stats: IStats }> = [];
	public loading: number = 0;
	public viz: {
		sectors_stats: Array<{ sector: ISector; stats: IStats }>;
		scores_in_years: IStatsInYears;
		scores_in_sectors: IStatsCpvs;
		volume_regions: IStatsNuts;
	} = {
		sectors_stats: null,
		scores_in_sectors: null,
		scores_in_years: null,
		volume_regions: null
	};
	public filter: {
		time?: {
			startYear: number;
			endYear: number;
			selectedStartYear: number;
			selectedEndYear: number;
		}
	} = {
		time: null
	};

	constructor(private api: ApiService, private notify: NotifyService) {
	}


	onSliderChange(event) {
		if (!this.filter.time) {
			return;
		}
		this.filter.time.selectedStartYear = event.startValue;
		this.filter.time.selectedEndYear = event.endValue;
		this.visualize();
	}

	visualize() {
		let filters = this.buildFilters();
		this.loading++;
		this.api.getMarketAnalysisStats({filters: filters}).subscribe(
			(result) => {
				this.display(result.data);
			},
			(error) => {
				this.notify.error(error);
			},
			() => {
				this.loading--;
			});
	}

	public ngOnInit(): void {
		this.visualize();
		// this.search();
	}

	public ngOnDestroy(): void {
	}

	buildFilters() {
		let filters = [];
		if (this.filter.time && this.filter.time.selectedStartYear > 0 && this.filter.time.selectedEndYear > 0) {
			let yearFilter: ISearchCommandFilter = {
				field: 'lots.awardDecisionDate',
				type: 'years',
				value: [this.filter.time.selectedStartYear, this.filter.time.selectedEndYear + 1],
			};
			filters.push(yearFilter);
		}
		return filters;
	}

	display(data: IStats): void {
		this.sectors_stats = [];
		this.viz.sectors_stats = null;
		this.viz.volume_regions = null;
		this.viz.scores_in_years = null;
		this.viz.scores_in_sectors = null;
		if (data) {
			this.viz.sectors_stats = data.sectors_stats;
			this.sectors_stats = data.sectors_stats;
			let nuts = {};
			data.region_stats.forEach(region => {
				nuts[region.id] = region.stats.sum_finalPriceEUR.value || 0;
			});
			this.viz.volume_regions = nuts;
			this.viz.scores_in_years = data.histogram_lots_awardDecisionDate_avg_scores['TENDER'];
			this.viz.scores_in_sectors = data.terms_main_cpv_divisions_avg_scores;
		}
		if (!this.filter.time && data.histogram_lots_awardDecisionDate) {
			let startYear = 0;
			let endYear = 0;
			Object.keys(data.histogram_lots_awardDecisionDate).forEach((key) => {
				let year = parseInt(key, 10);
				startYear = startYear == 0 ? year : Math.min(year, startYear);
				endYear = endYear == 0 ? year : Math.max(year, endYear);
			});
			this.filter.time = {
				startYear, endYear,
				selectedStartYear: startYear,
				selectedEndYear: endYear
			};
		}
	}

}
