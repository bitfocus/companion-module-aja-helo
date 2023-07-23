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
				this.instance.log('info', 'Successful Authentication')
			} else {
				this.instance.log('info', 'Bad Cookies: ' + JSON.stringify(cookies))
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
				this.instance.log('info', 'Bad response: ' + JSON.stringify(response))
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
			return {
				status: 'failed',
				response: String(err),
			}
		}
	}
}

module.exports = Helo
