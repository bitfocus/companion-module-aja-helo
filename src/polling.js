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
			self.pollingInterval = setInterval(async () => {
				let updated = false
				if (self.STATE.NameCounter == 0) {
					if (self.config.model == 'classic' || self.config.model == undefined) {
						for (let i = 1; i <= 10; i++) {
							let result = await self.connection.sendRequest(`action=get&paramid=eParamID_RecordingProfileName_${i}`)
							if (result.response.value != self.STATE.RecordingProfileNames[i - 1]) {
								self.STATE.RecordingProfileNames[i - 1] = result.response.value
								updated = true
							}
							result = await self.connection.sendRequest(`action=get&paramid=eParamID_StreamingProfileName_${i}`)
							if (result.response.value != self.STATE.StreamingProfileNames[i - 1]) {
								self.STATE.StreamingProfileNames[i - 1] = result.response.value
								updated = true
							}
						}
					}
					if (self.config.model == 'plus') {
						for (let i = 1; i <= 10; i++) {
							let result = await self.connection.sendRequest(`action=get&paramid=eParamID_LayoutName_${i}`)
							if (result.response.value != self.STATE.LayoutNames[i - 1]) {
								self.STATE.LayoutNames[i - 1] = result.response.value
								updated = true
							}
						}
					}
				}
				if (updated) {
					self.presets()
					self.updateActions()
				}
				// Now get the record status
				let result = await self.connection.sendRequest('action=get&paramid=eParamID_ReplicatorRecordState')
				self.log('debug', 'RecordStatePoll result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus('connection_failure', 'Failed to connect to device')
					return
				}

				self.STATE.recorder_status_value = parseInt(result.response.value)
				self.STATE.recorder_status = result.response.value_name

				// Now get the stream status
				result = await self.connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				self.log('debug', 'StreamStatePoll result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus('connection_failure', 'Failed to connect to device')
					return
				}

				self.STATE.stream_status_value = parseInt(result.response.value)
				self.STATE.stream_status = result.response.value_name

				result = await self.connection.sendRequest('action=get&paramid=eParamID_CurrentMediaAvailable')
				self.log('debug', 'MediaAvailablePoll result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus('connection_failure', 'Failed to connect to device')
					return
				}

				self.STATE.storage_media_available = parseInt(result.response.value)

				result = await self.connection.sendRequest('action=get&paramid=eParamID_BeerGoggles')

				if (result.status === 'failed') {
					self.updateStatus('connection_failure', 'Failed to connect to device')
					return
				}

				self.STATE.beer_goggles = result.response.value_name

				self.checkVariables()
				self.checkFeedbacks()
				// Incrememnt counter
				self.STATE.NameCounter += 1
				self.STATE.NameCounter %= 10
			}, self.config.polling_rate)
		}
	},
}
