import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AboutOpentenderPage} from './opentender/opentender.component';
import {AboutPage} from './about.component';

const routes: Routes = [
	{
		path: '', component: AboutPage,
		children: [
			{path: '', redirectTo: 'about-opentender', pathMatch: 'full'},
			{path: 'about-opentender', component: AboutOpentenderPage},
		]
	}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
