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

				self.status(self.STATUS_OK)

				self.setVariable('recorder_status_value', resultRecord.response.value)
				self.setVariable('recorder_status', resultRecord.response.value_name)
				self.recordStatus = resultRecord.response.value
				self.checkFeedbacks('recordStatus');

				// Now get the stream status
				const resultStream = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				self.debug('info', resultStream)

				if (resultStream.status === 'failed') {
					self.status(self.STATUS_WARNING)
					return
				}

				self.status(self.STATUS_OK)

				self.setVariable('stream_status_value', resultStream.response.value)
				self.setVariable('stream_status', resultStream.response.value_name)
				self.streamStatus = resultStream.response.value
				self.checkFeedbacks('streamStatus');

			}, self.config.polling_rate)
		}
	},
}
