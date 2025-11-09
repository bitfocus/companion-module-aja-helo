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
		// https://gitlab.aja.com/pub/rest_api/-/blob/master/HELO/03_HELO_Commands.md?ref_type=heads#example-get-record-state-with-authentication-enabled
		let requestUrl = this.baseUrl + '/authenticator/login'

		let requestOptions = {
			method: 'POST',
			headers: new Headers({
				'Content-Type': 'application/x-www-form-urlencoded',
			}),
			body: new URLSearchParams({
				password_provided: this.auth_password,
			}),
			signal: AbortSignal.timeout(2000),
		}

		const response = await fetch(requestUrl, requestOptions)
		let result = await response.json()

		if (result.login == 'success') {
			let cookies = response.headers.getSetCookie()
			if (cookies.length == 1) {
				this.session = cookies[0]
				this.instance.log('info', 'auth: Successful Authentication')
			} else {
				this.instance.log('error', `auth: Bad Cookies: ${JSON.stringify(cookies)}`)
			}
		} else {
			this.session = null
			this.instance.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to authenticate with password')
		}
	}

	async sendRequest(cmd) {
		return this.sendCustomRequest('/config?', cmd, null, 'GET')
	}

	async sendCustomRequest(url, cmd, body, method) {
		if (body === undefined || body === null) {
			this.instance.log('debug', `api call: ${method} request to ${url}${cmd}`)
		} else {
			this.instance.log('debug', `api call: ${method} request to ${url}${cmd} with body: ${JSON.stringify(body)}`)
		}
		let requestUrl = this.baseUrl + url + cmd
		let requestOptions = {
			method: method,
			headers: new Headers(),
			signal: AbortSignal.timeout(2000), // adds timeout to fetch requests
			// Without timeout, failed requests can hang and cause config loading to fail
		}
		// Set content-type for methods with body
		if (
			['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) &&
			typeof body === 'object' &&
			Object.keys(body).length > 0
		) {
			requestOptions['headers'].append('Content-Type', 'application/x-www-form-urlencoded')
			requestOptions['body'] = new URLSearchParams(body).toString() // NOTE: this is URLSearchParams, not JSON
		}

		// Set cookie for authenticated requests
		if (this.auth_required) {
			if (this.session === null) {
				await this.authenticate()
			}
			requestOptions['headers'].append('cookie', this.session)
		}

		try {
			let response = await fetch(requestUrl, requestOptions)
			if (response.status == 404 && this.auth_required) {
				// in the case of a 404 with auth required most likely case is session expiry
				// reauthenticate and try again
				await this.authenticate()
				this.instance.log('debug', `api call: retrying request (' ${url}${cmd}') after reauth`)
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
}

module.exports = Helo
