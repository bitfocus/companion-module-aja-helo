var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}


instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);
	self.init_presets();

	debug = self.debug;
	log   = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
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
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

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

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 1',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n1',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 0
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 2',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n2',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 1
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 3',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n3',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 2
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 4',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n4',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 3
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 5',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n5',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 4
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 6',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n6',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 5
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 7',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n7',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 6
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 8',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n8',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 7
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 9',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n9',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 8
					}
				}
			]
		});

		presets.push({
			category: 'Record Profiles',
			label: 'Record Profile 10',
			bank: {
				style: 'text',
				text: 'RECORD\\nPROFILE\\n10',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'RecordingProfileSel&value=',
						profileNum: 9
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 1',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n1',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 0
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 2',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n2',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 1
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 3',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n3',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 2
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 4',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n4',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 3
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 5',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n5',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 4
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 6',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n6',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 5
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 7',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n7',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 6
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 8',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n8',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 7
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 9',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n9',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 8
					}
				}
			]
		});

		presets.push({
			category: 'Stream Profiles',
			label: 'Stream Profile 10',
			bank: {
				style: 'text',
				text: 'STREAM\\nPROFILE\\n10',
				size: '14',
				color: '16777215',
				bgcolor: 0
			},
			actions: [
				{
					action: 'setProfile',
					options: {
						profileType: 'StreamingProfileSel&value=',
						profileNum: 9
					}
				}
			]
		});

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'startStop':    {
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
			]
		},

		'setProfile':    {
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
			]
		},

		'renameFile': {
			label: 'Rename File',
			options: [
				{
					 type:    'textinput',
					 label:   'file name',
					 id:      'fileName'
				}
			]
		},
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd  = 'config?action=set&paramid=eParamID_';
	var opt  = action.options;
	debug('action: ', action);

	switch (action.action) {

		case 'startStop':
			cmd += action.options.command;
			break;

		case 'setProfile':
			cmd += action.options.profileType + action.options.profileNum;
			break;

		case 'renameFile':
			cmd += 'FilenamePrefix&value=' + action.options.fileName;
			break;

	}

		if (cmd !== undefined) {
			self.system.emit('rest_get', 'http://' + self.config.host + '/' + cmd,function (err, data, response) {
				if (err) {
					self.log('error', 'Error from AJA: ' + response);
					return;
				}
			});
		}

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
