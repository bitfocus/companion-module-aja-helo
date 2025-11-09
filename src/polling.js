const { InstanceStatus } = require('@companion-module/base')
module.exports = {
	/**
	 * Inits the polling logic
	 */
	initPolling() {
		let self = this

		let pollingErrorMsg = 'Failed to connect to device during polling'

		// Cleanup old interval
		if (self.pollingInterval) {
			clearInterval(self.pollingInterval)
			self.log('info', `polling: Polling ${self.config.host} stopped...`)
		}

		// Setup polling if enabled and host is set
		if (self.config.enable_polling && self.config.host) {
			self.log('info', `polling: Polling ${self.config.host} started...`)
			self.pollingInterval = setInterval(async () => {
				// If expanding polling to additional paramaters, consider using events feature
				// http://<device-ip>/rest.tml -> Events
				let updated = false
				if (
					// Update names if:
					// enough time has passed since last name update
					Date.now() - self.STATE.LastNameUpdateTime >= self.config.name_refresh_rate ||
					// or if it's the first run after config update with "On Config Update" selected
					(self.config.name_refresh_rate == -1 && self.STATE.LastNameUpdateTime == 0)
				) {
					self.log('debug', 'polling: Updating Names from device')
					if (self.config.model == 'classic' || self.config.model == undefined) {
						// Update Recording and Streaming Profile Names
						for (let i = 1; i <= self.STATE.StreamingProfileNames.length; i++) {
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
						// Update Layout Names
						for (let i = 1; i <= self.STATE.LayoutNames.length; i++) {
							let result = await self.connection.sendRequest(`action=get&paramid=eParamID_LayoutName_${i}`)
							if (result.response.value != self.STATE.LayoutNames[i - 1]) {
								self.STATE.LayoutNames[i - 1] = result.response.value
								updated = true
							}
						}
					}
					for (let i = 1; i <= self.STATE.PresetNames.length; i++) {
						// Update Preset Names
						let result = await self.connection.sendRequest(`action=get&paramid=eParamID_PresetName_${i}`)
						if (result.response.value != self.STATE.PresetNames[i - 1]) {
							self.STATE.PresetNames[i - 1] = result.response.value
							updated = true
						}
					}
					self.STATE.LastNameUpdateTime = Date.now()
				}
				if (updated) {
					self.presets()
					self.updateActions()
				}
				// Now get the record status
				let result = await self.connection.sendRequest('action=get&paramid=eParamID_ReplicatorRecordState')
				self.log('debug', 'polling: RecordState result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
					self.log('error', 'polling: Failed to get RecordState')
					return
				}

				self.STATE.recorder_status_value = parseInt(result.response.value)
				self.STATE.recorder_status = result.response.value_name

				if (self.STATE.recorder_status_value !== 2) {
					// If recorder is stopped, reset recording duration
					self.STATE.recording_duration = '00:00:00:00'
				}

				// Now get the stream status
				result = await self.connection.sendRequest('action=get&paramid=eParamID_ReplicatorStreamState')
				self.log('debug', 'polling: StreamState result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
					self.log('error', 'polling: Failed to get StreamState')
					return
				}

				if (self.STATE.stream_status_value !== 2) {
					// If stream is stopped, reset streaming durations
					self.STATE.streaming_duration = '00:00:00:00'
				}

				self.STATE.stream_status_value = parseInt(result.response.value)
				self.STATE.stream_status = result.response.value_name

				result = await self.connection.sendRequest('action=get&paramid=eParamID_CurrentMediaAvailable')
				self.log('debug', 'polling: MediaAvailable result: ' + JSON.stringify(result))

				if (result.status === 'failed') {
					self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
					self.log('error', 'polling: Failed to get MediaAvailable')
					return
				}

				self.STATE.storage_media_available = parseInt(result.response.value)

				result = await self.connection.sendRequest('action=get&paramid=eParamID_Temperature')

				if (result.status === 'failed') {
					self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
					self.log('error', 'polling: Failed to get Device Temperature')
					return
				}

				self.STATE.device_temperature = parseInt(result.response.value)

				result = await self.connection.sendRequest('action=get&paramid=eParamID_BeerGoggles')

				if (result.status === 'failed') {
					self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
					self.log('error', 'polling: Failed to get BeerGoggles')
					return
				}

				self.STATE.beer_goggles = result.response.value_name

				standard_vars = [
					['streaming_duration', 'eParamID_StreamingDuration'],
					['stream1_duration', 'eParamID_Stream1_Duration'],
					['stream2_duration', 'eParamID_Stream2_Duration'],
					['recording_duration', 'eParamID_RecordingDuration'],
					['scheduler_current_event', 'eParamID_SchedulerCurrentEvent'],
					['scheduler_next_event', 'eParamID_SchedulerNextEvent'],
				]
				for (const [state, param] of standard_vars) {
					result = await self.connection.sendRequest(`action=get&paramid=${param}`)

					if (result.status === 'failed') {
						self.updateStatus(InstanceStatus.ConnectionFailure, pollingErrorMsg)
						self.log('error', `polling: Failed to get ${param}`)
						return
					}
					self.STATE[state] = result.response.value
				}

				self.checkVariables()
				self.checkFeedbacks()
			}, self.config.polling_rate)
		}
	},
}
