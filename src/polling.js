const Helo = require('./Helo')

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		let self = this
		// Cleanup old interval
		if (self.pollingInterval) {
			clearInterval(self.pollingInterval)
		}

		// Setup polling if enabled and host is set
		if (self.config.enable_polling && self.config.host) {
			self.log('debug', `Polling ${self.config.host} started...`)

			const connection = new Helo(self.config)
			self.pollingInterval = setInterval(async () => {
				// Now get the record status
				let result = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorRecordState')
				self.debug('info', result)

				if (result.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.recorder_status_value = result.response.value
				self.STATE.recorder_status = result.response.value_name

				// Now get the stream status
				result = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				self.debug('info', result)

				if (result.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.stream_status_value = result.response.value
				self.STATE.stream_status = result.response.value_name


				result = await connection.sendRequest('action=get&paramid=eParamID_CurrentMediaAvailable')
				self.debug('info', result)

				if (result.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.storage_media_available = result.response.value

				result = await connection.sendRequest('action=get&paramid=eParamID_BeerGoggles')
				self.debug('info', result)

				if (result.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.beer_goggles = result.response.value_name

				self.checkVariables()
				self.checkFeedbacks()
			}, self.config.polling_rate)
		}
	},
}
