var InstanceSkel = require('../../instance_skel');
const configFields = require('./src/configFields')
const variables = require('./src/variables')
const polling = require('./src/polling')
const actions = require('./src/actions')
const presets = require('./src/presets')


class HeloInstance extends InstanceSkel {
	constructor(system, id, config) {
		super(system, id, config)

		this.config = config
		this.pollingInterval = undefined

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...configFields,
			...variables,
			...polling,
			...actions,
			...presets,
		})
	}

	init() {
		this.status(this.STATUS_UNKNOWN)

		// Update the config
		this.updateConfig()
	}

	updateConfig(config) {
		if (config) {
			this.config = config
		}

		// Quickly check if certain config values are present and continue setup
		if (this.config.host) {
			// Update the actions
			this.actions()

			// Update Variables
			this.updateVariableDefinitions()

			// Init the presets
			this.presets()

			// Start polling for settingvalues
			this.initPolling()

			// Set status to OK
			this.status(this.STATUS_OK)
		}
	}

	destroy() {
		// Cleanup polling
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval)
		}

		this.debug('destroy', this.id)
	}

}

module.exports = HeloInstance
