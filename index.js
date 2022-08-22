var InstanceSkel = require('../../instance_skel');
const configFields = require('./src/configFields')
const variables = require('./src/variables')
const polling = require('./src/polling')
const actions = require('./src/actions')
const presets = require('./src/presets')
const feedbacks = require('./src/feedbacks')


class HeloInstance extends InstanceSkel {
	constructor(system, id, config) {
		super(system, id, config)

		let self = this

		self.config = config
		self.pollingInterval = undefined

		self.STATE = {
			'recorder_status_value': 0,
			'recorder_status': 'eRRSUninitialized',
			'stream_status_value': 0,
			'stream_status': 'eRRSUninitialized',
			'storage_media_available': 0
		}

		// Assign the methods from the listed files to this class
		Object.assign(self, {
			...configFields,
			...variables,
			...polling,
			...actions,
			...presets,
			...feedbacks,
		})
	}

	init() {
		let self = this

		self.status(self.STATUS_UNKNOWN)

		// Update the config
		self.updateConfig()
	}

	updateConfig(config) {
		let self = this

		if (config) {
			self.config = config
		}

		// Quickly check if certain config values are present and continue setup
		if (self.config.host) {
			// Update the actions
			self.actions()

			self.feedbacks()

			// Update Variables
			self.updateVariableDefinitions()
			self.checkVariables()

			// Init the presets
			self.presets()

			// Start polling for settingvalues
			self.initPolling()

			// Set status to OK
			self.status(self.STATUS_OK)
		}
	}

	destroy() {
		let self = this
		// Cleanup polling
		if (self.pollingInterval) {
			clearInterval(self.pollingInterval)
		}

		self.debug('destroy', self.id)
	}

}

module.exports = HeloInstance
