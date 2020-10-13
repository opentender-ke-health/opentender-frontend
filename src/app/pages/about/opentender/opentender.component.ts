import {Component} from '@angular/core';
import {ConfigService} from '../../../services/config.service';

/**
 * The /about/opentender component displays a general introduction and the partner list
 */

@Component({
	moduleId: __filename,
	selector: 'opentender-about',
	templateUrl: 'opentender.component.html',
	styleUrls: ['opentender.component.scss']
})
export class AboutOpentenderPage {
	public countryName;
	constructor(public config: ConfigService) {
		this.countryName = config.country.id ? config.country.name : '';
	}
}
