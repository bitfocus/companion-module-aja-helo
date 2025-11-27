const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')

const config = require('./src/config')
const variables = require('./src/variables')
const polling = require('./src/polling')
const actions = require('./src/actions')
const presets = require('./src/presets')
const feedbacks = require('./src/feedbacks')
const utils = require('./src/util')
const Helo = require('./src/Helo')
const UpgradeScripts = require('./src/upgrades')

class HeloInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		let self = this
		// Assign the methods from the listed files to this class
		Object.assign(self, {
			...config,
			...variables,
			...polling,
			...actions,
			...presets,
			...feedbacks,
			...utils,
		})
	}

	async init(config) {
		let self = this

		self.updateStatus(InstanceStatus.Connecting, 'Initializing')
		self.STATE = {
			recorder_status_value: 0,
			recorder_status: 'eRRSUninitialized',
			stream_status_value: 0,
			stream_status: 'eRRSUninitialized',
			storage_media_available: 0,
			beer_goggles: 'No Beer...',
			recording_duration: '00:00:00:00',
			streaming_duration: '00:00:00:00',
			device_temperature: 0,
			scheduler_current_event: null,
			scheduler_next_event: null,
			LastNameUpdateTime: 0,
			RecordingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
			StreamingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
			LayoutNames: Array.from(Array(10)).map((e, i) => `Layout ${i + 1}`),
			PresetNames: Array.from(Array(20)).map((e, i) => `Preset #${i + 1}`),
		}

		self.pollingInterval = undefined

		// Update Variables
		self.updateVariableDefinitions()

		self.updateFeedbacks()

		await self.configUpdated(config)
	}

	async configUpdated(config) {
		let self = this
		self.log('debug', 'Module Config: ' + JSON.stringify(config))
		self.config = config
		self.STATE.LastNameUpdateTime = 0
		// Update the actions
		self.updateActions() //build actions regardless of connection status

		// Quickly check if certain config values are present and continue setup
		if (self.config.host && self.config.port) {
			self.log('debug', 'Host and Port set, continuing setup')
			self.updateStatus(InstanceStatus.Connecting, 'Config Updated')
			// update our connection in case host has changed
			self.connection = new Helo(self, self.config)

			// Test to confirm connection
			// Simply send a request to get the current media available
			let result = await self.connection.sendRequest('action=get&paramid=eParamID_CurrentMediaAvailable')
			if (result.status != 'success') {
				self.log('error', 'Confirm connection Failure: ' + JSON.stringify(result))
				self.updateStatus(InstanceStatus.ConnectionFailure, `Could not connect to Helo @ ${self.connection.baseUrl}`)
				return
			}

			// Start polling for settings values
			self.initPolling()

			// Init the presets
			self.presets()

			self.updateStatus(InstanceStatus.Ok)
		} else {
			self.log('debug', self.config.host ? 'Port not set' : 'Host not set')
			self.updateStatus(InstanceStatus.BadConfig, 'Missing required values')
		}
	}

	async destroy() {
		let self = this
		// Cleanup polling
		if (self.pollingInterval) {
			clearInterval(self.pollingInterval)
		}
		self.log('debug', 'destroy')
	}
}

runEntrypoint(HeloInstance, UpgradeScripts)
