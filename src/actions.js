const Helo = require('./Helo')

module.exports = {
	addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	},

	renameTimestamp() {
		let self = this

		let d = new Date();
		let curr_date = self.addZero(d.getDate());
		let curr_month = self.addZero(d.getMonth() + 1);
		let curr_year = self.addZero(d.getFullYear());
		let h = self.addZero(d.getHours());
		let m = self.addZero(d.getMinutes());
		let stamp = curr_year + "" + curr_month + "" + curr_date + "_" + h + m;
		return stamp;
	},

	sendCommand(cmd) {
		let self = this

		let prefix = 'action=set&paramid=eParamID_';
		if (cmd !== undefined) {
			const connection = new Helo(self.config)
			const result = connection.sendRequest(prefix + cmd).then(result => {
				self.debug('info', result)

				if (result.status === 'success') {
					self.status(self.STATUS_OK)
				} else {
					self.status(self.STATUS_ERROR)
				}
			}).catch(error => {
				let errorText = String(error)
				if (errorText.match('ECONNREFUSED')) {
					self.log('error', 'Unable to connect to the streamer...')
					self.status(self.STATUS_ERROR)
				} else if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND')) {
					self.log('error', 'Connection to streamer has timed out...')
				} else {
					self.log('error', 'An error has occurred when connecting to streamer...')
				}
			})
		}
	},

	actions() {
		let self = this; // required to have referenec to outer `this`
		let actionsArr = {};

		actionsArr.startStop = {
			label: 'Choose Commands',
			options: [
				{
					type: 'dropdown',
					label: 'Choose Command',
					id: 'command',
					width: 12,
					default: 'ReplicatorCommand&value=1',
					choices: [
						{ id: 'ReplicatorCommand&value=1', label: 'Start Record' },
						{ id: 'ReplicatorCommand&value=2', label: 'Stop Record' },
						{ id: 'ReplicatorCommand&value=3', label: 'Start Stream' },
						{ id: 'ReplicatorCommand&value=4', label: 'Stop Stream' },
					]
				},
			],
			callback: function (action, bank) {
				let cmd = action.options.command;
				self.sendCommand(cmd);
			}
		};

		actionsArr.mute = {
			label: 'Mute',
			callback: function (action, bank) {
				let cmd = 'AVMute&value=1';
				self.sendCommand(cmd);
			}
		}

		actionsArr.unmute = {
			label: 'Unmute',
			callback: function (action, bank) {
				let cmd = 'AVMute&value=0';
				self.sendCommand(cmd);
			}
		}

		if ((self.config.model == 'classic') || (self.config.model == undefined)) {
			actionsArr.setProfile = {
				label: 'Choose Profiles',
				options: [
					{
						type: 'dropdown',
						label: 'Set Profile',
						id: 'profileType',
						width: 12,
						default: 'RecordingProfileSel&value=',
						choices: [
							{ id: 'RecordingProfileSel&value=', label: 'Record Profile' },
							{ id: 'StreamingProfileSel&value=', label: 'Stream Profile' }
						]
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
							{ id: '9', label: '10' }
						]
					},
				],
				callback: function (action, bank) {
					let cmd = action.options.profileType + action.options.profileNum;
					self.sendCommand(cmd);
				}
			};
		}

		actionsArr.renameFile = {
			label: 'Rename File',
			options: [
				{
					type: 'textinput',
					label: 'file name',
					id: 'fileName'
				}
			],
			callback: function (action, bank) {
				let cmd = 'FilenamePrefix&value=' + action.options.fileName;
				self.sendCommand(cmd);
			}
		};

		actionsArr.renameFileTs = {
			label: 'Rename File - Timestamp',
			callback: function (action, bank) {
				let timeStamp = self.renameTimestamp();
				let cmd = 'FilenamePrefix&value=' + timeStamp;
				self.sendCommand(cmd);
			}
		};

		if (self.config.model == 'plus') {
			actionsArr.selectLayout = {
				label: 'Select Layout',
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
							{ id: 10, label: 'Layout 10' }
						]
					}
				],
				callback: function (action, bank) {
					let cmd = 'LayoutSelector&value=' + action.options.layout;
					self.sendCommand(cmd);
				}
			};

			actionsArr.selectLayoutAndDo = {
				label: 'Select Layout and Recall/Load Template',
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
							{ id: 10, label: 'Layout 10' }
						]
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
						]
					}
				],
				callback: function (action, bank) {
					self.sendCommand('LayoutSelector&value=' + action.options.layout);
					//self.sendCommand('LayoutCommand&value=' + action.options.action);
					setTimeout(function () {
						self.sendCommand('LayoutCommand&value=' + action.options.action);
					}, 20);
				}
			};

			actionsArr.recallSelectedLayout = {
				label: 'Recall Selected Layout',
				callback: function (action, bank) {
					let cmd = 'LayoutCommand&value=1';
					self.sendCommand(cmd);
				}
			};

			/*actionsArr.storeSelectedLayout = {
				label: 'Store Selected Layout',
				callback: function (action, bank) {
					let cmd = 'LayoutCommand&value=2';
					self.sendCommand(cmd);
				}
			};*/
		}

		self.setActions(actionsArr);
	},
}
