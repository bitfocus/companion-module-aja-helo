const { combineRgb } = require('@companion-module/base')
module.exports = {
	updateFeedbacks() {
		let self = this
		const feedbacks = {}

		const white = combineRgb(255, 255, 255)
		const black = combineRgb(0, 0, 0)
		const red = combineRgb(220, 53, 69)
		const green = combineRgb(0, 204, 0)
		const orange = combineRgb(255, 102, 0)
		const blue = combineRgb(0, 0, 255)

		feedbacks.recordStatus = {
			type: 'boolean',
			name: 'Record Status',
			description: 'Indicate if Helo is Recording',
			defaultStyle: {
				color: black,
				bgcolor: red,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'status',
					default: 1,
					choices: [
						{ id: 0, label: 'Idle' },
						{ id: 1, label: 'Recording' },
						{ id: 2, label: 'Failed' },
					],
				},
			],
			callback: function (feedback) {
				let opt = feedback.options
				let errsStatus = []
				switch (opt.status) {
					case 0:
						// Add uninit, idle, shutdown
						errsStatus.push(0, 1, 5)
						break
					case 1:
						// add record status
						errsStatus.push(2)
						break
					case 2:
						// add both failed in idle and record
						errsStatus.push(3, 4)
						break
				}

				if (self.STATE.recorder_status_value !== -1) {
					if (errsStatus.includes(self.STATE.recorder_status_value)) {
						return true
					}
				}
				return false
			},
		}

		feedbacks.streamStatus = {
			type: 'boolean',
			name: 'Stream Status',
			description: 'Indicate if Helo is Streaming',
			defaultStyle: {
				color: black,
				bgcolor: red,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X Status',
					id: 'status',
					default: 1,
					choices: [
						{ id: 0, label: 'Idle' },
						{ id: 1, label: 'Streaming' },
						{ id: 2, label: 'Failed' },
					],
				},
			],
			callback: function (feedback) {
				let opt = feedback.options
				let errsStatus = []
				switch (opt.status) {
					case 0:
						// Add uninit, idle, shutdown
						errsStatus.push(0, 1, 5)
						break
					case 1:
						// add stream status
						errsStatus.push(2)
						break
					case 2:
						// add both failed in idle and stream
						errsStatus.push(3, 4)
						break
				}
				if (self.STATE.stream_status_value !== -1) {
					if (errsStatus.includes(self.STATE.stream_status_value)) {
						return true
					}
				}
				return false
			},
		}

		feedbacks.mediaAvailable = {
			type: 'boolean',
			name: 'Storage Available',
			description: 'Indicate if the primary recording drive has low media space available',
			defaultStyle: {
				color: black,
				bgcolor: orange,
			},
			options: [
				{
					type: 'number',
					label: 'Indicate on less than X % remaining',
					id: 'checkValue',
					default: 5,
				},
			],
			callback: function (feedback) {
				let opt = feedback.options

				if (self.STATE.storage_media_available < opt.checkValue) {
					return true
				}
				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
