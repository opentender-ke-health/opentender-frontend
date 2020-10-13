import {Component, Input} from '@angular/core';

@Component({
	selector: 'accordion',
	templateUrl: './accordion.component.html',
	styleUrls: ['./accordion.component.scss']
})
export class accordionComponent {
	@Input() public title = '';
	public showDescription = false;
	constructor() {
	}

	public toggleDescription() {
		this.showDescription = !this.showDescription;
	}
}
