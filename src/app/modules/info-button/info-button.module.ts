import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import InfoButton from './info-button.component';

@NgModule({
	imports: [
		CommonModule,
	],
    declarations: [
        InfoButton,
    ],
    exports: [
        InfoButton,
    ]
})
export class InfoButtonModule {
}
