const { InstanceStatus } = require('@companion-module/base')

module.exports = {
	updateActions() {
		let self = this // required to have referenec to outer `this`
		let actions = {}

		const sendCommand = async (cmd) => {
			let self = this
			let prefix = 'action=set&paramid=eParamID_'
			if (cmd !== undefined) {
				try {
					const result = await self.connection.sendRequest(prefix + cmd)
					self.log('debug', 'action call: Command result: ' + JSON.stringify(result))

					if (result.status === 'success') {
						self.updateStatus(InstanceStatus.Ok)
					} else {
						self.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to connect to device: ' + result.response)
					}
				} catch (error) {
					let errorText = String(error)
					if (errorText.match('ECONNREFUSED')) {
						self.log('error', 'Unable to connect to the streamer...')
						self.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to connect to device')
					} else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
						self.log('error', 'Connection to streamer has timed out...')
					} else {
						self.log('error', 'An error has occurred when connecting to streamer: ' + errorText)
					}
				}
			}
		}

		actions.startStop = {
			name: 'Record / Stream Control',
			description: 'Start or Stop Recording / Stream',
			options: [
				{
					type: 'dropdown',
					label: 'Choose Command',
					id: 'command',
					default: 'ReplicatorCommand&value=1',
					choices: [
						{ id: 'ReplicatorCommand&value=1', label: 'Start Record' },
						{ id: 'ReplicatorCommand&value=2', label: 'Stop Record' },
						{ id: 'ReplicatorCommand&value=3', label: 'Start Stream' },
						{ id: 'ReplicatorCommand&value=4', label: 'Stop Stream' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.command
				await sendCommand(cmd)
			},
		}

		actions.toggleRecord = {
			name: 'Toggle Recording',
			description: 'Start or Stop Recording',
			options: [],
			callback: async (event) => {
				let cmd = 'ReplicatorCommand&value='
				if (self.STATE.recorder_status_value != 2) {
					cmd += '1'
				} else {
					cmd += '2'
				}
				await sendCommand(cmd)
			},
		}

		actions.toggleStream = {
			name: 'Toggle Streaming',
			description: 'Start or Stop Streaming',
			options: [],
			callback: async (event) => {
				let cmd = 'ReplicatorCommand&value='
				if (self.STATE.stream_status_value != 2) {
					cmd += '3'
				} else {
					cmd += '4'
				}
				await sendCommand(cmd)
			},
		}

		actions.videoInSelect = {
			name: 'Set Video Input',
			options: [
				{
					type: 'dropdown',
					label: 'Choose Video Input',
					id: 'input',
					default: 'VideoInSelect&value=0',
					tooltip:
						'Selects a video input source from the video input connections available. This is the video that will be recorded and/or passed through.',
					choices: [
						{ id: 'VideoInSelect&value=0', label: 'SDI' },
						{ id: 'VideoInSelect&value=1', label: 'HDMI' },
						{ id: 'VideoInSelect&value=2', label: 'Test Pattern' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.input
				await sendCommand(cmd)
			},
		}

		actions.audioInSelect = {
			name: 'Set Audio Input',
			options: [
				{
					type: 'dropdown',
					label: 'Choose Audio Input',
					id: 'input',
					default: 'AudioInSelect&value=0',
					tooltip:
						'Selects an audio input source from the audio input connections available, including embedded SDI audio which requires an SDI video source and HDMI audio, which requires an HDMI video source.',
					choices: [
						{ id: 'AudioInSelect&value=0', label: 'SDI' },
						{ id: 'AudioInSelect&value=1', label: 'HDMI' },
						{ id: 'AudioInSelect&value=2', label: 'Analog' },
						{ id: 'AudioInSelect&value=4', label: 'None' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.input
				await sendCommand(cmd)
			},
		}

		actions.analogAudioInputLevel = {
			name: 'Set Audio Level (Analog Audio only)',
			options: [
				{
					type: 'dropdown',
					label: 'Choose Audio Level on analog signal',
					id: 'level',
					tooltip:
						'Selects the analog input audio level, where 0dB is the least sensitive and +12dB is the most sensitive',
					default: 'AnalogAudioInputLevel&value=0',
					choices: [
						{ id: 'AnalogAudioInputLevel&value=0', label: '0dB' },
						{ id: 'AnalogAudioInputLevel&value=1', label: '+6dB' },
						{ id: 'AnalogAudioInputLevel&value=2', label: '+12dB' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.level
				await sendCommand(cmd)
			},
		}

		actions.audioDelay = {
			name: 'Set Audio Delay',
			options: [
				{
					type: 'number',
					label: 'Audio Delay (ms)',
					tooltip:
						'Delays audio on analog, HDMI, recordings, and streams by a fixed number of milliseconds relative to input (0-300 ms)',
					id: 'audioDelay',
					min: 0,
					max: 300,
					default: 0,
					required: true,
					step: 1,
					range: false,
				},
			],
			callback: async (event) => {
				let cmd = 'DelayAudioMs&value=' + event.options.audioDelay
				await sendCommand(cmd)
			},
		}

		actions.mute = {
			name: 'Mute',
			options: [],
			callback: async (event) => {
				let cmd = 'AVMute&value=1'
				await sendCommand(cmd)
			},
		}

		actions.unmute = {
			name: 'Unmute',
			options: [],
			callback: async (event) => {
				let cmd = 'AVMute&value=0'
				await sendCommand(cmd)
			},
		}

		if (self.config.model == 'classic' || self.config.model == undefined) {
			actions.setProfile = {
				name: 'Choose Profiles',
				options: [
					{
						type: 'dropdown',
						label: 'Set Profile',
						id: 'profileType',
						width: 12,
						default: 'RecordingProfileSel',
						choices: [
							{ id: 'RecordingProfileSel', label: 'Record Profile' },
							{ id: 'StreamingProfileSel', label: 'Stream Profile' },
						],
					},
					{
						type: 'dropdown',
						label: 'Choose Recording Profile',
						id: 'recordingProfileNum',
						width: 12,
						default: '0',
						choices: Array.from(Array(10)).map((e, i) => {
							return { id: i.toString(), label: self.STATE.RecordingProfileNames[i] }
						}),
						isVisible: (options) => options.profileType === 'RecordingProfileSel',
					},
					{
						type: 'dropdown',
						label: 'Choose Streaming Profile',
						id: 'streamingProfileNum',
						width: 12,
						default: '0',
						choices: Array.from(Array(10)).map((e, i) => {
							return { id: i.toString(), label: self.STATE.StreamingProfileNames[i] }
						}),
						isVisible: (options) => options.profileType === 'StreamingProfileSel',
					},
				],
				callback: async (event) => {
					let cmd =
						event.options.profileType +
						'&value=' +
						(event.options.profileType === 'RecordingProfileSel'
							? event.options.recordingProfileNum
							: event.options.streamingProfileNum)
					await sendCommand(cmd)
				},
			}
		}

		actions.renameFile = {
			name: 'Rename File',
			options: [
				{
					type: 'textinput',
					label: 'file name',
					id: 'fileName',
					tooltip: 'Set the base filename for recordings.',
					useVariables: true,
				},
			],
			callback: async (event) => {
				let cmd = 'FilenamePrefix&value=' + event.options.fileName
				await sendCommand(cmd)
			},
		}

		actions.renameFileTs = {
			name: 'Rename File - Timestamp',
			options: [],
			callback: async (event) => {
				let timeStamp = self.renameTimestamp()
				let cmd = 'FilenamePrefix&value=' + timeStamp
				await sendCommand(cmd)
			},
		}

		if (self.config.model == 'plus') {
			actions.selectLayout = {
				name: 'Select Layout',
				options: [
					{
						label: 'Layout',
						type: 'dropdown',
						id: 'layout',
						default: 1,
						choices: Array.from(Array(self.STATE.LayoutNames.length)).map((e, i) => {
							return { id: i + 1, label: self.STATE.LayoutNames[i] }
						}),
					},
				],
				callback: async (event) => {
					let cmd = 'LayoutSelector&value=' + event.options.layout
					await sendCommand(cmd)
				},
			}

			actions.selectLayoutAndDo = {
				name: 'Select Layout and Recall/Load Template',
				options: [
					{
						label: 'Layout',
						type: 'dropdown',
						id: 'layout',
						default: 1,
						choices: Array.from(Array(self.STATE.LayoutNames.length)).map((e, i) => {
							return { id: i + 1, label: self.STATE.LayoutNames[i] }
						}),
					},
					{
						label: 'Action',
						type: 'dropdown',
						id: 'action',
						default: '1',
						choices: [
							{ id: '0', label: 'None' },
							{ id: '1', label: 'Recall' },
							//{ id: '2', label: 'Store'},
							{ id: '3', label: 'Template' },
						],
					},
				],
				callback: async (event) => {
					await sendCommand('LayoutSelector&value=' + event.options.layout)
					//await sendCommand('LayoutCommand&value=' + event.options.action);
					setTimeout(function () {
						sendCommand('LayoutCommand&value=' + event.options.action)
					}, 20)
				},
			}

			actions.recallSelectedLayout = {
				name: 'Recall Selected Layout',
				options: [],
				callback: async (event) => {
					let cmd = 'LayoutCommand&value=1'
					await sendCommand(cmd)
				},
			}

			/*actionsArr.storeSelectedLayout = {
				label: 'Store Selected Layout',
				callback: function (action, bank) {
					let cmd = 'LayoutCommand&value=2';
					await sendCommand(cmd);
				}
			};*/
		}

		actions.recallPreset = {
			name: 'Recall Preset',
			options: [
				{
					label: 'Layout',
					type: 'dropdown',
					id: 'layout',
					default: 1,
					choices: Array.from(Array(self.STATE.PresetNames.length)).map((e, i) => {
						return { id: i + 1, label: self.STATE.PresetNames[i] }
					}),
				},
			],
			callback: async (event) => {
				let cmd = 'RegisterRecall&value=' + event.options.layout
				await sendCommand(cmd)
				setTimeout(async function () {
					const result = await self.connection.sendRequest('action=get&paramid=eParamID_RegisterRecallResult')
					self.log('info', `Recall Preset ${event.options.layout}: ${JSON.stringify(result['response']['value_name'])}`)
				}, 1000)
			},
		}

		actions.eraseAllClips = {
			name: 'Erase All Clips',
			options: [],
			callback: async (event) => {
				let body = {
					action: 'delete',
					recdest: '0',
					clipname: '*',
				}
				const result = await self.connection.sendCustomRequest('/clips', '', body, 'POST')
				self.log('debug', 'action call: Command result: ' + JSON.stringify(result))
			},
		}

		actions.schedulerEnabled = {
			name: 'Scheduler Control',
			options: [
				{
					type: 'dropdown',
					label: 'Enable or Disable Scheduler',
					id: 'enabled',
					default: 'SchedulerEnabled&value=0',
					choices: [
						{ id: 'SchedulerEnabled&value=0', label: 'Disabled' },
						{ id: 'SchedulerEnabled&value=1', label: 'Enabled' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.enabled
				await sendCommand(cmd)
			},
		}

		actions.schedulerActivity = {
			name: 'Scheduler Activity',
			options: [
				{
					type: 'dropdown',
					label: 'Determine what should be active during a scheduled event',
					id: 'activity',
					default: 'SchedulerActivity&value=1',
					choices: [
						{ id: 'SchedulerActivity&value=1', label: 'Record Only' },
						{ id: 'SchedulerActivity&value=2', label: 'Stream Only' },
						{ id: 'SchedulerActivity&value=3', label: 'Record and Stream' },
					],
				},
			],
			callback: async (event) => {
				let cmd = event.options.activity
				await sendCommand(cmd)
			},
		}

		actions.recordingDestination = {
			name: 'Set Recording Destination',
			options: [
				{
					type: 'dropdown',
					label: 'Select Recording Destination Type',
					id: 'type',
					default: 'Primary',
					choices: [
						{ id: 'Primary', label: 'Primary' },
						{ id: 'Secondary', label: 'Secondary' },
					],
				},
				{
					type: 'dropdown',
					label: 'Recording Destination',
					id: 'destination',
					default: 'RecordingDestination&value=0',
					choices: [
						{ id: 'RecordingDestination&value=0', label: 'SD' },
						{ id: 'RecordingDestination&value=1', label: 'USB' },
						{ id: 'RecordingDestination&value=2', label: 'SMB Network Share' },
						{ id: 'RecordingDestination&value=3', label: 'NFS Network Share' },
					],
					isVisible: (options) => options.type === 'Primary',
				},
				{
					type: 'dropdown',
					label: 'Secondary Recording Destination',
					id: 'destinationSecondary',
					default: 'SecondaryRecordingDestination&value=4',
					choices: [
						{ id: 'SecondaryRecordingDestination&value=4', label: 'None' },
						{ id: 'SecondaryRecordingDestination&value=0', label: 'SD' },
						{ id: 'SecondaryRecordingDestination&value=1', label: 'USB' },
					],
					isVisible: (options) => options.type === 'Secondary',
				},
			],
			callback: async (event) => {
				let cmd = event.options.type === 'Primary' ? event.options.destination : event.options.destinationSecondary
				await sendCommand(cmd)
			},
		}

		self.setActionDefinitions(actions)
	},
}
