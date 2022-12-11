const { combineRgb } = require('@companion-module/base')

module.exports = {
	presets() {
		let self = this
		const presets = {}

		const white = combineRgb(255, 255, 255)
		const black = combineRgb(0, 0, 0)
		const red = combineRgb(220, 53, 69)
		const green = combineRgb(0, 204, 0)
		const orange = combineRgb(255, 102, 0)
		const blue = combineRgb(0, 0, 255)

		presets.startRecord = {
			type: 'button',
			category: 'Commands',
			name: 'Start Record',
			style: {
				text: 'START RECORD',
				size: '14',
				color: white,
				bgcolor: green,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startStop',
							options: {
								command: 'ReplicatorCommand&value=1',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recordStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
			],
		}

		presets.stopRecord = {
			type: 'button',
			category: 'Commands',
			name: 'Stop Record',
			style: {
				text: 'STOP RECORD',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startStop',
							options: {
								command: 'ReplicatorCommand&value=2',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.toggleRecord = {
			type: 'button',
			category: 'Commands',
			name: 'Toggle Record',
			style: {
				text: 'HELO RECORD',
				size: '14',
				color: white,
				bgcolor: green,
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggleRecord',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recordStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
			],
		}

		presets.startStream = {
			type: 'button',
			category: 'Commands',
			name: 'Start Stream',
			style: {
				text: 'START STREAM',
				size: '14',
				color: white,
				bgcolor: green,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startStop',
							options: {
								command: 'ReplicatorCommand&value=3',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'streamStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
			],
		}

		presets.stopStream = {
			type: 'button',
			category: 'Commands',
			name: 'Stop Stream',
			style: {
				text: 'STOP STREAM',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startStop',
							options: {
								command: 'ReplicatorCommand&value=4',
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.toggleStream = {
			type: 'button',
			category: 'Commands',
			name: 'Toggle Stream',
			style: {
				text: 'HELO STREAM',
				size: '14',
				color: white,
				bgcolor: green,
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggleStream',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'streamStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
			],
		}

		presets.mediaAvailable = {
			type: 'button',
			category: 'Informative',
			name: 'Storage Space',
			style: {
				text: 'Storage Remaining\n$(helo:storage_media_available)',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'mediaAvailable',
					options: {
						checkValue: 10,
					},
					style: {
						color: white,
						bgcolor: orange,
					},
				},
				{
					feedbackId: 'mediaAvailable',
					options: {
						checkValue: 5,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
			],
		}
		presets.streamStatus = {
			type: 'button',
			category: 'Informative',
			name: 'Stream status',
			style: {
				text: 'Stream status',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'streamStatus',
					options: {
						status: 0,
					},
					style: {
						color: white,
						bgcolor: blue,
					},
				},
				{
					feedbackId: 'streamStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
				{
					feedbackId: 'streamStatus',
					options: {
						status: 2,
					},
					style: {
						color: white,
						bgcolor: black,
					},
				},
			],
		}
		presets.recordStatus = {
			type: 'button',
			category: 'Informative',
			name: 'Stream status',
			style: {
				text: 'Record status',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'recordStatus',
					options: {
						status: 0,
					},
					style: {
						color: white,
						bgcolor: blue,
					},
				},
				{
					feedbackId: 'recordStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red,
					},
				},
				{
					feedbackId: 'recordStatus',
					options: {
						status: 2,
					},
					style: {
						color: white,
						bgcolor: black,
					},
				},
			],
		}

		if (self.config.model == 'classic' || self.config.model == undefined) {
			for (let i = 1; i <= 10; i++) {
				presets[`recordProfile${i}`] = {
					type: 'button',
					category: 'Record Profiles',
					name: 'Record Profile ' + i,
					style: {
						text: self.STATE.RecordingProfileNames[i - 1],
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [
						{
							down: [
								{
									actionId: 'setProfile',
									options: {
										profileType: 'RecordingProfileSel&value=',
										profileNum: i - 1,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [],
				}
				presets[`streamProfile${i}`] = {
					type: 'button',
					category: 'Stream Profiles',
					name: 'Stream Profile ' + i,
					style: {
						text: self.STATE.StreamingProfileNames[i - 1],
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [
						{
							down: [
								{
									actionId: 'setProfile',
									options: {
										profileType: 'StreamingProfileSel&value=',
										profileNum: i - 1,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [],
				}
			}
		}

		if (self.config.model == 'plus') {
			for (let i = 1; i <= 10; i++) {
				presets[`selectLayout${i}`] = {
					type: 'button',
					category: 'Layouts',
					name: 'Select Layout ' + i,
					style: {
						text: 'SELECT\\nLAYOUT\\n' + i,
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [
						{
							down: [
								{
									actionId: 'selectLayout',
									options: {
										layout: i,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [],
				}

				presets[`recallLayout${i}`] = {
					type: 'button',
					category: 'Layouts',
					name: 'Recall Layout ' + i,
					style: {
						text: 'RECALL\\nLAYOUT\\n' + i,
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [
						{
							down: [
								{
									actionId: 'selectLayoutAndDo',
									options: {
										layout: i,
										action: '1',
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [],
				}
			}
		}

		self.setPresetDefinitions(presets)
	},
}
