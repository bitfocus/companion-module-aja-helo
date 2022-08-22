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
				const resultRecord = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorRecordState')
				self.debug('info', resultRecord)

				if (resultRecord.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.recorder_status_value = resultRecord.response.value
				self.STATE.recorder_status = resultRecord.response.value_name

				// Now get the stream status
				const resultStream = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				self.debug('info', resultStream)

				if (resultStream.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.stream_status_value = resultStream.response.value
				self.STATE.stream_status = resultStream.response.value_name


				const resultMedia = await connection.sendRequest('action=get&paramid=eParamID_CurrentMediaAvailable')
				self.debug('info', resultMedia)

				if (resultMedia.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.STATE.storage_media_available = resultMedia.response.value

				self.checkVariables()
				self.checkFeedbacks()
			}, self.config.polling_rate)
		}
	},
}
