var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}


instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

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

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {

		'startRecord': {
			label: 'Start Record',
		},

		'stopRecord': {
			label: 'Stop Record',
		},

		'renameFile': {
			label: 'Rename File',
			options: [
				{
					 type:    'textinput',
					 label:   'file name',
					 id:      'idx'
				}
			]
		},

		'recordProfile': {
			label: 'Set Record Profile',
			options: [
				{
					 type:    'textinput',
					 label:   'Profile Number 1-10',
					 id:      'idx',
					 default: '1'
				}
			]
		},

		'startStream': {
			label: 'Start Stream',
		},

		'stopStream': {
			label: 'Stop Stream',
			options: [
			]
		},

		'streamProfile': {
			label: 'Set Stream Profile',
			options: [
				{
					 type:    'textinput',
					 label:   'Profile Number 1-10',
					 id:      'idx',
					 default: '1'
				}
			]
		},

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	debug('action: ', action);

	switch (action.action) {

		case 'startRecord':
			cmd = 'config?action=set&paramid=eParamID_ReplicatorCommand&value=1';
			break;

		case 'stopRecord':
			cmd = 'config?action=set&paramid=eParamID_ReplicatorCommand&value=2';
			break;

		case 'renameFile':
			cmd = 'config?action=set&paramid=eParamID_FilenamePrefix&value=' + action.options.idx;
			break;

		case 'recordProfile':
			cmd = 'config?action=set&paramid=eParamID_RecordingProfileSel&value=' + (parseInt(action.options.idx) - 1);
			break;

		case 'startStream':
			cmd = 'config?action=set&paramid=eParamID_ReplicatorCommand&value=3';
			break;

		case 'stopStream':
			cmd = 'config?action=set&paramid=eParamID_ReplicatorCommand&value=4';
			break;

		case 'streamProfile':
			cmd = 'config?action=set&paramid=eParamID_StreamingProfileSel&value=' + (parseInt(action.options.idx) - 1);
			break;

	}

		if (cmd !== undefined) {
			self.system.emit('rest_get', 'http://' + self.config.host + '/' + cmd,function (err, data, response) {
				if (err) {
					self.log('Error from AJA: ' + response);
					return;
					console.log('Result from REST: ', + response);
				}
			});
		}

};

instance.module_info = {
	label: 'AJA HELO',
	id: 'helo',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
