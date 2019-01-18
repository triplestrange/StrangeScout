import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ApiQueryService {

	getEvents(team: string, callback) {
		const xhr = new XMLHttpRequest();
		let requestPath: string;
		if (team === '') {
			requestPath = '/api/events';
		} else {
			requestPath = '/api/team/' + team + '/events';
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(xhr.responseText);
				} else {
					callback('[]');
				}
			}
		};
		xhr.open('GET', requestPath, true);
		xhr.send();
	}

	getTeams(event: string, match: string, callback) {
		const xhr = new XMLHttpRequest();
		let requestPath: string;
		if (event === '') {
				requestPath = '/api/teams';
		} else {
			if (match === '') {
				requestPath = '/api/event/' + event + '/teams';
			} else {
				requestPath = '/api/event/' + event + '/match/' + match + '/teams';
			}
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(xhr.responseText);
				} else {
					callback('[]');
				}
			}
		};
		xhr.open('GET', requestPath, true);
		xhr.send();
	}

	getMatches(event: string, team: string, callback) {
		const xhr = new XMLHttpRequest();
		let requestPath: string;
		if (event !== '') {
			if (team === '') {
				requestPath = '/api/event/' + event + '/matches';
			} else {
				requestPath = '/api/event/' + event + '/team/' + team + '/matches';
			}
		} else {
			callback('[]');
			return;
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(xhr.responseText);
				} else {
					callback('[]');
				}
			}
		};
		xhr.open('GET', requestPath, true);
		xhr.send();
	}

	getQueryPath(event: string, team: string, match: string) {
		let requestPath: string;
		if (event === '') {
			// all events
			if (team === '') {
				// all teams (whole DB)
				requestPath = '/api/dump';
			} else {
				// specific team (single team)
				requestPath = '/api/team/' + team;
			}
		} else {
			// specific event
			if (team === '') {
				// all teams
				if (match === '') {
					// all matches (full event)
					requestPath = '/api/event/' + event;
				} else {
					// specific match (single match)
					requestPath = '/api/event/' + event + '/match/' + match;
				}
			} else {
				// specific team
				if (match === '') {
					// all matches (team at event)
					requestPath = '/api/event/' + event + '/team/' + team;
				} else {
					// specific match (single run)
					requestPath = '/api/event/' + event + '/team/' + team + '/match/' + match;
				}
			}
		}
		return requestPath;
	}

	getQuery(event: string, team: string, match: string, callback) {
		const xhr = new XMLHttpRequest();
		let requestPath: string;
		let response: string;
		requestPath = this.getQueryPath(event, team, match);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					response = xhr.responseText;
					if (!response.startsWith('[')) {
						response = '[' + response;
					}
					if (!response.endsWith(']')) {
						response = response + ']';
					}
				}
				callback(response);
			} else {
				callback('[]');
				return;
			}
		};
		xhr.open('GET', requestPath, true);	
		xhr.send();
	}

	constructor() { }
}
