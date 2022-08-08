const Helo = require('./Helo')

module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		// Cleanup old interval
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
		}

		// Setup polling if enabled and host is set
		if (this.config.enable_polling && this.config.host) {
			this.log('debug', `Polling ${this.config.host} started...`)

			const connection = new Helo(this.config)
			this.pollingInterval = setInterval(async () => {
				// Now get the record status
				const resultRecord = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorRecordState')
				this.debug('info', resultRecord)

				if (resultRecord.status === 'failed') {
					this.status(this.STATUS_WARNING)
					return
				}

				this.status(this.STATUS_OK)

				this.setVariable('recorder_status_value', resultRecord.response.value)
				this.setVariable('recorder_status', resultRecord.response.value_name)
				this.setVariable('recording_status', resultRecord.response.value == 2 ? true : false)

				// Now get the stream status
				const resultStream = await connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				this.debug('info', resultStream)

				if (resultStream.status === 'failed') {
					this.status(this.STATUS_WARNING)
					return
				}

				this.status(this.STATUS_OK)

				this.setVariable('stream_status_value', resultStream.response.value)
				this.setVariable('stream_status', resultStream.response.value_name)
				this.setVariable('streaming_status', resultStream.response.value == 2 ? true : false)

			}, this.config.polling_rate)
		}
	},
}
