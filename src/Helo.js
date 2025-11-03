const { InstanceStatus } = require('@companion-module/base')

class Helo {
	constructor(instance, config) {
		this.instance = instance

		const apiHost = config.host
		const apiPort = config.port

		this.baseUrl = `http://${apiHost}:${apiPort}`

		this.auth_required = config.auth_required
		this.auth_password = config.auth_password
		this.session = null
	}

	async authenticate() {
		let requestUrl = this.baseUrl + '/authenticator/login'

		let requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				password_provided: this.auth_password,
			}),
		}

		const response = await fetch(requestUrl, requestOptions)
		let result = await response.json()

		if (result.login == 'success') {
			let cookies = response.headers.getSetCookie()
			if (cookies.length == 1) {
				this.session = cookies[0]
				this.instance.log('info', 'auth: Successful Authentication')
			} else {
				this.instance.log('error', 'auth: Bad Cookies: ' + JSON.stringify(cookies))
			}
		} else {
			this.session = null
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to authenticate with password')
		}
	}
	async sendRequest(cmd) {
		let requestUrl = this.baseUrl + '/config?' + cmd
		let requestOptions = {
			method: 'GET',
			signal: AbortSignal.timeout(2000), // prevents config init loop on connection failure
		}

		if (this.auth_required) {
			if (this.session === null) {
				await this.authenticate()
			}
			requestOptions['headers'] = { cookie: this.session }
		}

		this.instance.log('debug', `api call: ${cmd}`)
		try {
			let response = await fetch(requestUrl, requestOptions)
			if (response.status == 404 && this.auth_required) {
				// in the case of a 404 with auth required most likely case is session expiry
				// reauthenticate and try again
				await this.authenticate()
				this.instance.log('debug', `api call: retrying request ('${cmd}') after reauth`)
				response = await fetch(requestUrl, requestOptions)
			}
			if (!response.ok) {
				this.instance.log('error', `api call: bad response from device: ${JSON.stringify(response)}`)
				return {
					status: 'failed',
					response: `Device returned a bad response: ${response.statusText}`,
				}
			}
			return {
				status: 'success',
				response: await response.json(),
			}
		} catch (err) {
			this.instance.log('error', `api call: An error occurred: ${JSON.stringify(err)}`)
			return {
				status: 'failed',
				response: String(err),
			}
		}
	}

	async sendCustomRequest(url, cmd, body, method) {
		let requestUrl = this.baseUrl + url + cmd

		/*var formBody = [];
		for (var property in body) {
			var encodedKey = encodeURIComponent(property);
			var encodedValue = encodeURIComponent(details[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");*/

		let requestOptions = {
			method: method,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(body).toString(),
		}

		if (this.auth_required) {
			if (this.session === null) {
				await this.authenticate()
			}
			requestOptions['headers'] = { cookie: this.session }
		}

		try {
			let response = await fetch(requestUrl, requestOptions)
			if (response.status == 404 && this.auth_required) {
				// in the case of a 404 with auth required most likely case is session expiry
				// reauthenticate and try again
				await this.authenticate()
				response = await fetch(requestUrl, requestOptions)
			}
			if (!response.ok) {
				this.instance.log('error', 'api call: bad response from device: ' + JSON.stringify(response))
				return {
					status: 'failed',
					response: 'Device returned a bad response: ' + response.statusText,
				}
			}
			return {
				status: 'success',
				response: await response.json(),
			}
		} catch (err) {
			this.instance.log('error', 'api call: An error occured: ' + JSON.stringify(err))
			return {
				status: 'failed',
				response: String(err),
			}
		}
	}
}

module.exports = Helo
