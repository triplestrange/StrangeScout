import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ApiQueryService {

	getEvents(team: string, callback) {
		var xhr = new XMLHttpRequest();
		var requestPath: string;
		if (parseInt(team) == 0) {
			requestPath = "/api/events"
		} else {
			requestPath = "/api/team/" + team + "/events"
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText)
				} else {
					callback('[]')
				}
			}
		}
		xhr.open('GET', requestPath, true)
		xhr.send()
	}

	getTeams(event: string, match: string, callback) {
		var xhr = new XMLHttpRequest();
		var requestPath: string;
		if (event == "all") {
				requestPath = "/api/teams"
		} else {
			if (parseInt(match) == 0) {
				requestPath = "/api/event/" + event + "/teams"
			} else {
				requestPath = "/api/event/" + event + "/match/" + match + "/teams"
			}
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText)
				} else {
					callback('[]')
					return
				}
			}
		}
		xhr.open('GET', requestPath, true)
		xhr.send()
	}

	getMatches(event: string, team: string, callback) {
		var xhr = new XMLHttpRequest();
		var requestPath: string;
		if (event != "all") {
			if (parseInt(team) == 0) {
				requestPath = "/api/event/" + event + "/matches"
			} else {
				requestPath = "/api/event/" + event + "/team/" + team + "/matches"
			}
		} else {
			callback('[]')
			return
		}
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText)
				} else {
					callback('[]')
					return
				}
			}
		}
		xhr.open('GET', requestPath, true)
		xhr.send()
	}

	getQueryPath(event: string, team: string, match: string) {
		var requestPath: string;
		if (event == "all") {
			// all events
			if (team == "0") {
				// all teams (whole DB)
				requestPath = "/api/dump"
			} else {
				// specific team (single team)
				requestPath = "/api/team/" + team
			}
		} else {
			// specific event
			if (team == "0") {
				// all teams
				if (match == "0") {
					// all matches (full event)
					requestPath = "/api/event/" + event
				} else {
					// specific match (single match)
					requestPath = "/api/event/" + event + "/match/" + match
				}
			} else {
				// specific team
				if (match == "0") {
					// all matches (team at event)
					requestPath = "/api/event/" + event + "/team/" + team
				} else {
					// specific match (single run)
					requestPath = "/api/event/" + event + "/team/" + team + "/match/" + match
				}
			}
		}
		return requestPath
	}

	getQuery(event: string, team: string, match: string, json: boolean, callback) {
		var xhr = new XMLHttpRequest();
		var requestPath: string;
		requestPath = this.getQueryPath(event, team, match)
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText)
				} else {
					if (json) {
						callback('[]')
					} else {
						callback('')
					}
					return
				}
			}
		}
		xhr.open('GET', requestPath, true)
		// need this to get JSON back
		if (json) {
			xhr.setRequestHeader('Accept', 'application/json')
		}
		xhr.send()
	}

	constructor() { }
}
