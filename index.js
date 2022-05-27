var instance_skel = require('../../instance_skel');
var debug;
var log;

function addZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

function renameTimestamp() {
	let d          = new Date();
	let curr_date  = addZero(d.getDate());
	let curr_month = addZero(d.getMonth()+1);
	let curr_year  = addZero(d.getFullYear());
	let h          = addZero(d.getHours());
	let m          = addZero(d.getMinutes());
	let stamp      = curr_year + "" + curr_month + "" + curr_date + "_" + h + m;
	return stamp;
};

function instance(system, id, config) {
	let self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	return self;
}

instance.prototype.init = function() {
	let self = this;

	self.status(self.STATE_OK);

	self.init_actions();
	self.init_presets();

	debug = self.debug;
	log   = self.log;
};

instance.prototype.updateConfig = function(config) {
	let self = this;

	self.status(self.STATE_OK);

	self.config = config;

	self.init_actions();
	self.init_presets();
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	let self = this;
	return [
		{
			type:  'text',
			id:    'info',
			width: 12,
			label: 'Information',
			value: 'This module controls an AJA HELO appliance.  <a href="https://www.aja.com/products/helo#support" target="_new">HELO Support</a>'
		},
		{
			type:  'textinput',
			id:    'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Model',
			default: 'classic',
			choices: [
				{ id: 'classic', label: 'Classic'},
				{ id: 'plus', label: 'Plus'}
			]
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	let self = this;
	debug("destroy");
};

instance.prototype.init_presets = function () {
	let self = this;
	let presets = [];

	presets.push({
		category: 'Commands',
		label: 'Start Record',
		bank: {
			style: 'text',
			text: 'START RECORD',
			size: '14',
			color: '16777215',
			bgcolor: 52224
		},
		actions: [
			{
				action: 'startStop',
				options: {
					command: 'ReplicatorCommand&value=1'
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
			color: '16777215',
			bgcolor: 16711680
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
		label: 'Start Stream',
		bank: {
			style: 'text',
			text: 'START STREAM',
			size: '14',
			color: '16777215',
			bgcolor: 52224
		},
		actions: [
			{
				action: 'startStop',
				options: {
					command: 'ReplicatorCommand&value=3'
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
			color: '16777215',
			bgcolor: 16711680
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

	if ((self.config.model == 'classic') || (self.config.model == undefined)) {
		for (let i = 1; i <= 10; i++) {
			presets.push({
				category: 'Record Profiles',
				label: 'Record Profile ' + i,
				bank: {
					style: 'text',
					text: 'RECORD\\nPROFILE\\n' + i,
					size: '14',
					color: '16777215',
					bgcolor: 0
				},
				actions: [
					{
						action: 'setProfile',
						options: {
							profileType: 'RecordingProfileSel&value=',
							profileNum: (i-1)
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
					color: '16777215',
					bgcolor: 0
				},
				actions: [
					{
						action: 'setProfile',
						options: {
							profileType: 'StreamingProfileSel&value=',
							profileNum: (i-1)
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
					color: '16777215',
					bgcolor: 0
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
					color: '16777215',
					bgcolor: 0
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
	
			/*presets.push({
				category: 'Layouts',
				label: 'Store Layout ' + i,
				bank: {
					style: 'text',
					text: 'STORE\\nLAYOUT\\n' + i,
					size: '14',
					color: '16777215',
					bgcolor: 0
				},
				actions: [
					{
						action: 'selectLayoutAndDo',
						options: {
							layout: i,
							action: '2'
						}
					}
				]
			});*/
		}
	}	

	self.setPresetDefinitions(presets);
}

instance.prototype.init_actions = function(system) {
	let self = this;

	let actionsArr = {};

	actionsArr.startStop = {
		label: 'Choose Commands',
		options: [
			{
				type:    'dropdown',
				label:   'Choose Command',
				id:      'command',
				width:   12,
				default: 'ReplicatorCommand&value=1',
				choices:	[
					{ id: 'ReplicatorCommand&value=1',		label: 'Start Record' },
					{ id: 'ReplicatorCommand&value=2',		label: 'Stop Record' },
					{ id: 'ReplicatorCommand&value=3',		label: 'Start Stream' },
					{ id: 'ReplicatorCommand&value=4',		label: 'Stop Stream' },
				]
			},
		],
		callback: function(action, bank) {
			let cmd = action.options.command;
			self.sendCommand(cmd);
		}
	};

	actionsArr.mute = {
		label: 'Mute',
		callback: function(action, bank) {
			let cmd = 'AVMute&value=1';
			self.sendCommand(cmd);
		}
	}

	actionsArr.unmute = {
		label: 'Unmute',
		callback: function(action, bank) {
			let cmd = 'AVMute&value=0';
			self.sendCommand(cmd);
		}
	}

	if ((self.config.model == 'classic') || (self.config.model == undefined)) {
		actionsArr.setProfile = {
			label: 'Choose Profiles',
			options: [
				{
					type:    'dropdown',
					label:   'Set Profile',
					id:      'profileType',
					width:   12,
					default: 'RecordingProfileSel&value=',
					choices:	[
						{ id: 'RecordingProfileSel&value=',		label: 'Record Profile' },
						{ id: 'StreamingProfileSel&value=',		label: 'Stream Profile' }
					]
				},
				{
					type:   'dropdown',
					label:  'Choose Profile 1-10',
					id:     'profileNum',
					width:  12,
					default: '0',
					choices:	[
						{ id: '0',		label: '1' },
						{ id: '1',		label: '2' },
						{ id: '2',		label: '3' },
						{ id: '3',		label: '4' },
						{ id: '4',		label: '5' },
						{ id: '5',		label: '6' },
						{ id: '6',		label: '7' },
						{ id: '7',		label: '8' },
						{ id: '8',		label: '9' },
						{ id: '9',		label: '10' }
					]
				},
			],
			callback: function(action, bank) {
				let cmd = action.options.profileType + action.options.profileNum;
				self.sendCommand(cmd);
			}
		};
	}

	actionsArr.renameFile = {
		label: 'Rename File',
		options: [
			{
					type:    'textinput',
					label:   'file name',
					id:      'fileName'
			}
		],
		callback: function(action, bank) {
			let cmd = 'FilenamePrefix&value=' + action.options.fileName;
			self.sendCommand(cmd);
		}
	};

	actionsArr.renameFileTs = {
		label: 'Rename File - Timestamp',
		callback: function(action, bank) {
			let timeStamp = renameTimestamp();
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
						{ id: 1, label: 'Layout 1'},
						{ id: 2, label: 'Layout 2'},
						{ id: 3, label: 'Layout 3'},
						{ id: 4, label: 'Layout 4'},
						{ id: 5, label: 'Layout 5'},
						{ id: 6, label: 'Layout 6'},
						{ id: 7, label: 'Layout 7'},
						{ id: 8, label: 'Layout 8'},
						{ id: 9, label: 'Layout 9'},
						{ id: 10, label: 'Layout 10'}
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
						{ id: 1, label: 'Layout 1'},
						{ id: 2, label: 'Layout 2'},
						{ id: 3, label: 'Layout 3'},
						{ id: 4, label: 'Layout 4'},
						{ id: 5, label: 'Layout 5'},
						{ id: 6, label: 'Layout 6'},
						{ id: 7, label: 'Layout 7'},
						{ id: 8, label: 'Layout 8'},
						{ id: 9, label: 'Layout 9'},
						{ id: 10, label: 'Layout 10'}
					]
				},
				{
					label: 'Action',
					type: 'dropdown',
					id: 'action',
					default: '1',
					choices: [
						{ id: '0', label: 'None'},
						{ id: '1', label: 'Recall'},
						//{ id: '2', label: 'Store'},
						{ id: '3', label: 'Template'},
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
}

instance.prototype.sendCommand = function(cmd) {
	let self = this;

	let prefix = 'config?action=set&paramid=eParamID_';

	if (cmd !== undefined) {
		self.system.emit('rest_get', 'http://' + self.config.host + '/' + prefix + cmd,function (err, data, response) {
			if (err) {
				self.log('error', 'Error from AJA: ' + response);
				return;
			}
		});
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
