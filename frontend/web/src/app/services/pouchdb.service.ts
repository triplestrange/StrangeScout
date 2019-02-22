import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// toasts
import { ToastrService } from 'ngx-toastr';

import { UserService } from './user.service';

import { CookieService } from 'ngx-cookie-service';

// @ts-ignore
import PouchDB from 'pouchdb'

@Injectable({
  providedIn: 'root'
})
export class PouchdbService {

	constructor(private us: UserService, private toastr: ToastrService, private cs: CookieService) { }

	authenticateRemote(user: string, pass: string, callback) {
		const xhr = new XMLHttpRequest;
		const url = 'https://db.'+environment.domain+'/_session'
		xhr.open('POST', url)
		xhr.withCredentials = true;
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			// Call a function when the state changes.
			if (xhr.readyState === XMLHttpRequest.DONE) {
				callback(xhr.status);
			}
		}
		var URIuser = encodeURIComponent(user)
		var URIpass = encodeURIComponent(pass)
		var URIdata = `name=${URIuser}&password=${URIpass}`
		xhr.send(URIdata);
	}

	deauthenticateRemote() {
		const xhr = new XMLHttpRequest;
		const url = 'https://db.'+environment.domain+'/_session'
		xhr.withCredentials = true;
		xhr.open('DELETE', url)
		xhr.send()
	}

	// store doc in local db
	storeLocal(doc) {
		const localDB = new PouchDB('ssdb')
		localDB.put(doc)
		console.log(localDB.info())
	}

	// sync with remote db
	syncRemote() {
		const self = this;
		const remoteURL = 'https://db.'+environment.domain+'/ssdb'
		const localDB = new PouchDB('ssdb')
		const remoteDB = new PouchDB(remoteURL, {
			adapter: "http",
			fetch: (url, opts) => {
				opts.credentials = 'include';
				return PouchDB.fetch(url, opts);
			}
		})

		localDB.sync(remoteDB).on('complete', function () {
			self.toastr.success('Data synced');
			console.log(localDB.info());
		}).on('error', function (err) {
			self.toastr.error('Error syncing data!');
			console.log(err);
		});
	}

	deleteLocal() {
		const localDB = new PouchDB('ssdb');
		localDB.destroy();
	}

	/**
	 * Returns a promise that resolves true if the current user is an admin, else false
	 */
	isAdmin(): Promise<boolean> {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest;
			const url = 'https://db.'+environment.domain+'/_session'
			xhr.open('GET', url)
			xhr.withCredentials = true;
			xhr.onreadystatechange = function() {
				// Call a function when the state changes.
				if (xhr.readyState === XMLHttpRequest.DONE) {
					const res = JSON.parse(xhr.responseText);
					if (res.userCtx.roles.includes('_admin')) {
						console.log('admin')
						resolve(true);
					} else {
						console.log('notadmin')
						resolve(false);
					}
				}
			}
			xhr.send();
		});
	}
}
