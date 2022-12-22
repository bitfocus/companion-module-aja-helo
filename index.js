const { InstanceBase, runEntrypoint } = require('@companion-module/base')

const config = require('./src/config')
const variables = require('./src/variables')
const polling = require('./src/polling')
const actions = require('./src/actions')
const presets = require('./src/presets')
const feedbacks = require('./src/feedbacks')
const utils = require('./src/util')
const Helo = require('./src/Helo')

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

		self.STATE = {
			recorder_status_value: 0,
			recorder_status: 'eRRSUninitialized',
			stream_status_value: 0,
			stream_status: 'eRRSUninitialized',
			storage_media_available: 0,
			beer_goggles: 'No Beer...',
			NameCounter: 0,
			RecordingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
			StreamingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
			LayoutNames: Array.from(Array(10)).map((e, i) => `Layout ${i + 1}`),
		}

		self.pollingInterval = undefined

		self.config = config

		// Update Variables
		self.updateVariableDefinitions()

		self.updateFeedbacks()

		self.updateStatus('connecting', 'Waiting for Config Confirmation')
		self.configUpdated(config)
	}

	async configUpdated(config) {
		let self = this

		if (config) {
			self.config = config
		}

		// Quickly check if certain config values are present and continue setup
		if (self.config.host) {
			// update our connection in case host has changed
			self.connection = new Helo(self.config)

			// Start polling for settings values
			self.initPolling()

			// Init the presets
			self.presets()
			// Update the actions
			self.updateActions()

			// Set status to OK
			self.updateStatus('ok')
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

runEntrypoint(HeloInstance, [])
