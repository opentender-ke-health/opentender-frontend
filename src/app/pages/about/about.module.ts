import {NgModule} from '@angular/core';
import {routing} from './about.routing';
import {CommonModule} from '@angular/common';
import {AboutOpentenderPage} from './opentender/opentender.component';
import {FormsModule} from '@angular/forms';
import {BreadcrumbModule} from '../../modules/breadcrumb/breadcrumb.module';
import {accordionComponent} from './accordion/accordion.component';
import {AboutPage} from './about.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		BreadcrumbModule,
		routing
	],
	declarations: [
		AboutPage,
		AboutOpentenderPage,
		accordionComponent
	]
})
export class AboutModule {
}
