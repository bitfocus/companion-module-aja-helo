class Helo {
	constructor(config) {
		const apiHost = config.host
		const apiPort = config.port

		this.baseUrl = `http://${apiHost}:${apiPort}/config?`

		this.requestOptions = {
			method: 'GET',
			timeout: 10000,
		}
	}

	async sendRequest(cmd) {
		let requestUrl = this.baseUrl + cmd
		try {
			const response = await fetch(requestUrl, this.requestOptions)
			if (!response.ok) {
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
