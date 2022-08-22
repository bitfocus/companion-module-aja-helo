module.exports = {
	presets() {
		let self = this
		const presets = []

		const white = self.rgb(255, 255, 255)
		const black = self.rgb(0, 0, 0)
		const green = self.rgb(0, 204, 0)
		const red = self.rgb(220, 53, 69)
		const blue = self.rgb(0, 0, 255)



		presets.push({
			category: 'Commands',
			label: 'Start Record',
			bank: {
				style: 'text',
				text: 'START RECORD',
				size: '14',
				color: white,
				bgcolor: green
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=1'
					}
				}
			],
			feedbacks: [
				{
					type: 'recordStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red
					}
				}
			]
		});

		presets.push({
			category: 'Commands',
			label: 'Stop Record',
			bank: {
				style: 'text',
				text: 'STOP RECORD',
				size: '14',
				color: white,
				bgcolor: blue
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=2'
					}
				}
			]
		});

		presets.push({
			category: 'Commands',
			label: 'Helo Record',
			bank: {
				style: 'text',
				text: 'HELO RECORD',
				size: '14',
				latch: true,
				color: white,
				bgcolor: green
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=1'
					}
				}
			],
			release_actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=2'
					}
				}
			],
			feedbacks: [
				{
					type: 'recordStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red
					}
				}
			]
		});

		presets.push({
			category: 'Commands',
			label: 'Start Stream',
			bank: {
				style: 'text',
				text: 'START STREAM',
				size: '14',
				color: white,
				bgcolor: green
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=3'
					}
				}
			],
			feedbacks: [
				{
					type: 'streamStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red
					}
				}
			]
		});

		presets.push({
			category: 'Commands',
			label: 'Stop Stream',
			bank: {
				style: 'text',
				text: 'STOP STREAM',
				size: '14',
				color: white,
				bgcolor: blue
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=4'
					}
				}
			]
		});

		presets.push({
			category: 'Commands',
			label: 'Helo Stream',
			bank: {
				style: 'text',
				text: 'HELO STREAM',
				size: '14',
				latch: true,
				color: white,
				bgcolor: green
			},
			actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=3'
					}
				}
			],
			release_actions: [
				{
					action: 'startStop',
					options: {
						command: 'ReplicatorCommand&value=4'
					}
				}
			],
			feedbacks: [
				{
					type: 'streamStatus',
					options: {
						status: 1,
					},
					style: {
						color: white,
						bgcolor: red
					}
				}
			]
		});

		if ((self.config.model == 'classic') || (self.config.model == undefined)) {
			for (let i = 1; i <= 10; i++) {
				presets.push({
					category: 'Record Profiles',
					label: 'Record Profile ' + i,
					bank: {
						style: 'text',
						text: 'RECORD\\nPROFILE\\n' + i,
						size: '14',
						color: white,
						bgcolor: black
					},
					actions: [
						{
							action: 'setProfile',
							options: {
								profileType: 'RecordingProfileSel&value=',
								profileNum: (i - 1)
							}
						}
					]
				});
			}

			for (let i = 1; i <= 10; i++) {
				presets.push({
					category: 'Stream Profiles',
					label: 'Stream Profile ' + i,
					bank: {
						style: 'text',
						text: 'STREAM\\nPROFILE\\n' + i,
						size: '14',
						color: white,
						bgcolor: black
					},
					actions: [
						{
							action: 'setProfile',
							options: {
								profileType: 'StreamingProfileSel&value=',
								profileNum: (i - 1)
							}
						}
					]
				});
			}
		}

		if (self.config.model == 'plus') {
			for (let i = 1; i <= 10; i++) {
				presets.push({
					category: 'Layouts',
					label: 'Select Layout ' + i,
					bank: {
						style: 'text',
						text: 'SELECT\\nLAYOUT\\n' + i,
						size: '14',
						color: white,
						bgcolor: black
					},
					actions: [
						{
							action: 'selectLayout',
							options: {
								layout: i,
							}
						}
					]
				});

				presets.push({
					category: 'Layouts',
					label: 'Recall Layout ' + i,
					bank: {
						style: 'text',
						text: 'RECALL\\nLAYOUT\\n' + i,
						size: '14',
						color: white,
						bgcolor: black
					},
					actions: [
						{
							action: 'selectLayoutAndDo',
							options: {
								layout: i,
								action: '1'
							}
						}
					]
				});
			}
		}

		self.setPresetDefinitions(presets)
	},
}
