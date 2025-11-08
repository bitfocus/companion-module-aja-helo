const { Regex } = require('@companion-module/base')
module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info_module',
				width: 12,
				label: 'Information',
				value:
					'This module controls an AJA HELO appliance.  <a href="https://www.aja.com/products/helo#support" target="_new">HELO Support</a>',
			},
			{
				type: 'textinput',
				id: 'host',
				width: 8,
				label: 'Target IP (required)',
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'port',
				width: 6,
				label: 'Target Port (required)',
				default: '80',
				regex: Regex.PORT,
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Model',
				default: 'classic',
				choices: [
					{ id: 'classic', label: 'Classic' },
					{ id: 'plus', label: 'Plus' },
				],
			},
			{
				type: 'static-text',
				id: 'info_polling',
				width: 12,
				label: 'Polling',
				value:
					'Enable polling for variables / feedback. The module will query the streamer API periodically for the latest values.',
			},
			{
				type: 'checkbox',
				id: 'enable_polling',
				label: 'Enable Polling?',
				width: 2,
				default: true,
			},
			{
				type: 'dropdown',
				label: 'Polling Rate',
				id: 'polling_rate',
				isVisible: (configValues) => configValues.enable_polling === true,
				width: 3,
				default: 10000,
				choices: [
					{ id: 5000, label: '5s' },
					{ id: 10000, label: '10s' },
					{ id: 30000, label: '30s' },
				],
			},
			{
				type: 'dropdown',
				label: 'Name Refresh Rate',
				id: 'name_refresh_rate',
				description: 'How often the profile/layout/preset names are refreshed from the device.',
				isVisible: (configValues) => configValues.enable_polling === true,
				width: 7,
				default: 180000,
				choices: [
					{ id: 60000, label: '1m' },
					{ id: 180000, label: '3m' },
					{ id: 300000, label: '5m' },
					{ id: 600000, label: '10m' },
					{ id: -1, label: 'On Config Update' },
				],
			},
			{
				type: 'static-text',
				id: 'info_auth',
				width: 12,
				label: 'Authentication',
				value: 'Provide a password to authenticate to the streamer with.',
			},
			{
				type: 'checkbox',
				id: 'auth_required',
				label: 'Require password?',
				width: 4,
				default: false,
			},
			{
				type: 'textinput',
				// type: 'secret-text',
				// Added in @companion-module/base v1.13.0, required Companion v4.1+
				id: 'auth_password',
				width: 8,
				label: 'Password',
				isVisible: (configValues) => configValues.auth_required === true,
			},
		]
	},
}
