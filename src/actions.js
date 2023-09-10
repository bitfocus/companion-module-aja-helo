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
						default: 'RecordingProfileSel&value=',
						choices: [
							{ id: 'RecordingProfileSel&value=', label: 'Record Profile' },
							{ id: 'StreamingProfileSel&value=', label: 'Stream Profile' },
						],
					},
					{
						type: 'dropdown',
						label: 'Choose Profile 1-10',
						id: 'profileNum',
						width: 12,
						default: '0',
						choices: [
							{ id: '0', label: '1' },
							{ id: '1', label: '2' },
							{ id: '2', label: '3' },
							{ id: '3', label: '4' },
							{ id: '4', label: '5' },
							{ id: '5', label: '6' },
							{ id: '6', label: '7' },
							{ id: '7', label: '8' },
							{ id: '8', label: '9' },
							{ id: '9', label: '10' },
						],
					},
				],
				callback: async (event) => {
					let cmd = event.options.profileType + event.options.profileNum
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
				},
			],
			callback: async (event) => {
				let cmd = 'FilenamePrefix&value=' + event.options.fileName
				await sendCommand(cmd)
			},
		}

		actions.renameFileFromVariable = {
			name: 'Rename File - Variable',
			options: [
				{
					type: 'textinput',
					useVariables: true,
					label: 'Variable name',
					id: 'name',
					default: '',
					tooltip: 'You must provide the full variable name.\nFor example "$(internal:custom_my_cool_variable)"',
					regex: '$(([^:)]+):([^)]+))/g', // From instance_skel.js setPresetDefinitions
				},
			],
			callback: async (event) => {
				let cmd = 'FilenamePrefix&value='
				cmd += await self.parseVariablesInString(event.options.name)
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
						choices: [
							{ id: 1, label: self.STATE.LayoutNames[0] },
							{ id: 2, label: self.STATE.LayoutNames[1] },
							{ id: 3, label: self.STATE.LayoutNames[2] },
							{ id: 4, label: self.STATE.LayoutNames[3] },
							{ id: 5, label: self.STATE.LayoutNames[4] },
							{ id: 6, label: self.STATE.LayoutNames[5] },
							{ id: 7, label: self.STATE.LayoutNames[6] },
							{ id: 8, label: self.STATE.LayoutNames[7] },
							{ id: 9, label: self.STATE.LayoutNames[8] },
							{ id: 10, label: self.STATE.LayoutNames[9] },
						],
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
						choices: [
							{ id: 1, label: 'Layout 1' },
							{ id: 2, label: 'Layout 2' },
							{ id: 3, label: 'Layout 3' },
							{ id: 4, label: 'Layout 4' },
							{ id: 5, label: 'Layout 5' },
							{ id: 6, label: 'Layout 6' },
							{ id: 7, label: 'Layout 7' },
							{ id: 8, label: 'Layout 8' },
							{ id: 9, label: 'Layout 9' },
							{ id: 10, label: 'Layout 10' },
						],
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

		self.setActionDefinitions(actions)
	},
}
