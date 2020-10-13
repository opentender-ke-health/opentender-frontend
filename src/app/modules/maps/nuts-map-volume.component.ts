import {Component, Input} from '@angular/core';
import {IStatsNuts} from '../../app.interfaces';
import {I18NService} from '../i18n/services/i18n.service';
import * as Config from '../../../../config.dist.js';

@Component({
	selector: 'graph[volume-nutsmap]',
	template: `
		<div class="graph-title" i18n>
			Volume ({{currencySymbol}}) by Region
			<info-button>
				<p>
					The map shows the volume of contracts awarded by regions in JM$. Click on one area to view more details on public procurement in that region.<br>
					Region information was assigned using raw addresses published on the original source, for more details see the Data Explainer on the About page.
				</p>
			</info-button>
		</div>
		<div class="graph-toolbar-container">
			<div class="graph-toolbar graph-toolbar-right">
				<button class="tool-button" [ngClass]="{down:map_level==1}" (click)="setLevel(1)" i18n>Counties</button>
				<button class="tool-button" [ngClass]="{down:map_level==2}" (click)="setLevel(2)" i18n>Parishes</button>
			</div>
		</div>
		<graph nutsmap [data]="data" [level]="map_level" [title]="title" ></graph>`
})
export class MapVolumeComponent {
	@Input()
	data: IStatsNuts;
	public title: string;
	public map_level: number = 1;
	public formatTooltip: (featureProperties: any) => string;
	currencySymbol = Config.currencySymbol;

	constructor(private i18n: I18NService) {
		this.title = this.i18n.get(`Volume (${this.currencySymbol})`);
		this.formatTooltip = this.formatTooltipCallback.bind(this);
	}

	formatTooltipCallback(properties: any): string {
		return properties.name + ': ' + this.i18n.formatCurrencyValueEUR(properties.value);
	}

	setLevel(lvl: number): void {
		this.map_level = lvl;
	}
}
