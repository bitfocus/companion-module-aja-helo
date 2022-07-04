module.exports = {
	addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	},

	renameTimestamp() {
		let d = new Date();
		let curr_date = addZero(d.getDate());
		let curr_month = addZero(d.getMonth() + 1);
		let curr_year = addZero(d.getFullYear());
		let h = addZero(d.getHours());
		let m = addZero(d.getMinutes());
		let stamp = curr_year + "" + curr_month + "" + curr_date + "_" + h + m;
		return stamp;
	},

	actions() {
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
				this.sendCommand(cmd);
			}
		};

		actionsArr.mute = {
			label: 'Mute',
			callback: function (action, bank) {
				let cmd = 'AVMute&value=1';
				this.sendCommand(cmd);
			}
		}

		actionsArr.unmute = {
			label: 'Unmute',
			callback: function (action, bank) {
				let cmd = 'AVMute&value=0';
				this.sendCommand(cmd);
			}
		}

		if ((this.config.model == 'classic') || (this.config.model == undefined)) {
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
					this.sendCommand(cmd);
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
				this.sendCommand(cmd);
			}
		};

		actionsArr.renameFileTs = {
			label: 'Rename File - Timestamp',
			callback: function (action, bank) {
				let timeStamp = renameTimestamp();
				let cmd = 'FilenamePrefix&value=' + timeStamp;
				this.sendCommand(cmd);
			}
		};

		if (this.config.model == 'plus') {
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
					this.sendCommand(cmd);
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
					this.sendCommand('LayoutSelector&value=' + action.options.layout);
					//this.sendCommand('LayoutCommand&value=' + action.options.action);
					setTimeout(function () {
						this.sendCommand('LayoutCommand&value=' + action.options.action);
					}, 20);
				}
			};

			actionsArr.recallSelectedLayout = {
				label: 'Recall Selected Layout',
				callback: function (action, bank) {
					let cmd = 'LayoutCommand&value=1';
					this.sendCommand(cmd);
				}
			};

			/*actionsArr.storeSelectedLayout = {
				label: 'Store Selected Layout',
				callback: function (action, bank) {
					let cmd = 'LayoutCommand&value=2';
					this.sendCommand(cmd);
				}
			};*/
		}

		this.setActions(actionsArr);
	},
}
