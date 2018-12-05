import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RunFormComponent } from './run-form/run-form.component';
import { HomeComponent } from './home/home.component';
import { CacheManagementComponent } from './cache-management/cache-management.component';
import { DataComponent } from './data/data.component';

const routes: Routes = [
	{ path: '', component: HomeComponent, data: { state: 'home' } },
	{ path: 'scout', component: RunFormComponent, data: { state: 'run-form' } },
	{ path: 'cache', component: CacheManagementComponent, data: { state: 'cache-management' } },
	{ path: 'data', component: DataComponent, data: { state: 'data' } }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
