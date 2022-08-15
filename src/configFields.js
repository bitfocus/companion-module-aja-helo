module.exports = {
	config_fields() {
		// eslint-disable-line camelcase
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls an AJA HELO appliance.  <a href="https://www.aja.com/products/helo#support" target="_new">HELO Support</a>'
			},
			{
				type: 'textinput',
				id: 'host',
				width: 8,
				label: 'Target IP',
				regex: this.REGEX_IP,
			},
			{
				type: 'number',
				id: 'port',
				width: 6,
				label: 'Target Port',
				default: '80',
				regex: this.REGEX_PORT,
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Model',
				default: 'classic',
				choices: [
					{ id: 'classic', label: 'Classic' },
					{ id: 'plus', label: 'Plus' }
				]
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Polling',
				value:
					'When you need your variables to be up to date all the time, you have to enable polling. The module will query the streamer periodically for the latest values.',
			},
			{
				type: 'checkbox',
				id: 'enable_polling',
				label: 'Enable Polling?',
				width: 6,
				default: true,
			},
			{
				type: 'dropdown',
				label: 'Polling Rate',
				id: 'polling_rate',
				width: 6,
				default: 10000,
				choices: [
					{ id: 5000, label: '5000ms' },
					{ id: 10000, label: '10000ms' },
					{ id: 30000, label: '30000ms' },
				],
			},
		]
	},
}
