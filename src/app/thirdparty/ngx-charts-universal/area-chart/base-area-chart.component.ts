import {Input, Output, EventEmitter, HostListener, ElementRef, NgZone, ChangeDetectorRef} from '@angular/core';
import {IChartAreaSettings, IChartData} from '../chart.interface';
import d3 from '../d3';
import {UrlId} from '../utils/id.helper';
import {PlatformService} from '../common/chart/base-chart.component';
import {BaseXYAxisComponent} from '../common/chart/base-axes-chart.component';
import {toDate} from '../utils/date.helper';
import {IDomain, ILegendOptions} from '../common/common.interface';

export interface IAreaChartData {
	name: string|Date;
	value: number;
	d0?: number;
	d1?: number;
	series?: Array<IAreaChartData>;
}

export abstract class BaseAreaChartComponent extends BaseXYAxisComponent {
	@Input() chart: IChartAreaSettings;
	@Input() data: Array<IChartData>;
	@Output() select: EventEmitter<any>;
	@Input() activeEntries: any[];
	@Output() activate: EventEmitter<any>;
	@Output() deactivate: EventEmitter<any>;

	@Input() curve = d3.shape.curveLinear;

	xSet: any[]; // the set of all values on the X Axis
	seriesDomain: IDomain;
	scaleType: string;
	hoveredVertical: any; // the value of the x axis that is hovered over
	filteredDomain: any;
	timelineWidth: any;
	timelineHeight = 50;
	timelineXScale: any;
	timelineYScale: any;
	timelineXDomain: any;
	timelineTransform: any;
	timelinePadding = 10;
	areaData: Array<IAreaChartData> = [];
	clipId = new UrlId();

	constructor(protected chartElement: ElementRef, protected zone: NgZone, protected cd: ChangeDetectorRef, protected platform: PlatformService) {
		super(chartElement, zone, cd, platform);
	}

	abstract updateSet(): Array<IAreaChartData>;

	updateDomains(): void {
		if (this.chart.timeline) {
			this.viewDim.height -= (this.timelineHeight + this.margin[2] + this.timelinePadding);
		}
		if (this.filteredDomain) {
			this.xDomain = this.filteredDomain;
		}
		this.seriesDomain = this.getSeriesDomain();
	}

	getXScale() {
		return this._getXScale(this.xDomain, this.viewDim.width);
	}

	getYScale() {
		return this._getYScale(this.yDomain, this.viewDim.height);
	}

	updateScales(): void {
		this.areaData = this.updateSet();
		this.updateTimeline();
		this.clipId.generate('clip', this.platform.isBrowser);
	}

	cloneAreaData(): Array<IAreaChartData> {
		return this.data.map(item => {
			return {
				name: item.name, value: item.value, series: item.series.map(subitem => {
					return {name: subitem.name, value: subitem.value};
				})
			};
		});
	}

	updateTimeline(): void {
		if (this.chart.timeline) {
			this.timelineWidth = this.dim.width;

			if (this.chart.legend && this.chart.legend.show) {
				this.timelineWidth = this.viewDim.width;
			}

			this.timelineXDomain = this.getXDomain();
			this.timelineXScale = this._getXScale(this.timelineXDomain, this.timelineWidth);
			this.timelineYScale = this._getYScale(this.yDomain, this.timelineHeight);
			this.timelineTransform = `translate(${ this.viewDim.xOffset }, ${ -this.margin[2] })`;
		}
	}

	getXDomain(): IDomain {
		let values = [];

		for (let results of this.data) {
			for (let d of results.series) {
				if (!values.includes(d.name)) {
					values.push(d.name);
				}
			}
		}

		this.scaleType = this.getScaleType(values);
		let domain = [];

		if (this.scaleType === 'time') {
			values = values.map(v => toDate(v));
			let min = Math.min(...values);
			let max = Math.max(...values);
			domain = [new Date(min), new Date(max)];
		} else if (this.scaleType === 'linear') {
			values = values.map(v => Number(v));
			let min = Math.min(...values);
			let max = Math.max(...values);
			domain = [min, max];
		} else {
			domain = values;
		}

		this.xSet = values;

		return domain;
	}

	getSeriesDomain(): IDomain {
		return this.data.map(d => d.name);
	}

	_getXScale(domain, width) {
		let scale;

		if (this.scaleType === 'time') {
			scale = d3.scaleTime()
				.range([0, width])
				.domain(domain);
		} else if (this.scaleType === 'linear') {
			scale = d3.scaleLinear()
				.range([0, width])
				.domain(domain);
		} else if (this.scaleType === 'ordinal') {
			scale = d3.scalePoint()
				.range([0, width])
				.padding(0.1)
				.domain(domain);
		}

		return scale;
	}

	_getYScale(domain: IDomain, height: number) {
		const scale = d3.scaleLinear()
			.range([height, 0])
			.domain(domain.map(i => {
				return <number>i;
			}));
		return scale;
	}

	getScaleType(values): string {
		let date = true;
		let number = true;

		for (let value of values) {
			if (!this.isDate(value)) {
				date = false;
			}
			if (typeof value !== 'number') {
				number = false;
			}
		}

		if (date) {
			return 'time';
		}

		if (number) {
			return 'linear';
		}

		return 'ordinal';
	}

	isDate(value): boolean {
		return (value instanceof Date);
	}

	updateDomain(domain): void {
		this.filteredDomain = domain;
		this.xDomain = this.filteredDomain;
		this.xScale = this.getXScale();
	}

	updateHoveredVertical(item): void {
		this.hoveredVertical = item.value;
	}

	@HostListener('mouseleave')
	hideCircles(): void {
		this.hoveredVertical = null;
	}

	onClick(data, series): void {
		if (series) {
			data.series = series.name;
		}
		this.select.emit(data);
	}

	trackBy(index, item): string {
		return item.name;
	}

	getColorDomain(): IDomain {
		return (this.chart.schemeType === 'ordinal') ? this.seriesDomain : this.yDomain;
	}

	getLegendOptions(): ILegendOptions {
		if (this.chart.schemeType === 'ordinal') {
			return {
				scaleType: this.chart.schemeType,
				colors: this.colors,
				domain: this.seriesDomain
			};
		} else {
			return {
				scaleType: this.chart.schemeType,
				colors: this.colors.scale,
				domain: this.yDomain
			};
		}
	}
}