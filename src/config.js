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
				width: 4,
				default: true,
			},
			{
				type: 'dropdown',
				label: 'Polling Rate',
				id: 'polling_rate',
				isVisible: (configValues) => configValues.enable_polling === true,
				width: 8,
				default: 10000,
				choices: [
					{ id: 5000, label: '5000ms' },
					{ id: 10000, label: '10000ms' },
					{ id: 30000, label: '30000ms' },
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
				id: 'auth_password',
				width: 8,
				label: 'Password',
				isVisible: (configValues) => configValues.auth_required === true,
			},
		]
	},
}
