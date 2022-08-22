module.exports = {
	updateVariableDefinitions() {
		this.setVariableDefinitions([
			{
				label: `Recorder Status (Value)`,
				name: `recorder_status_value`,
			},
			{
				label: `Recorder Status`,
				name: `recorder_status`,
			},
			{
				label: `Stream Status (Value)`,
				name: `stream_status_value`,
			},
			{
				label: `Stream Status`,
				name: `stream_status`,
			},
			{
				label: `Available drive space`,
				name: `storage_media_available`,
			},
		])
	},

	checkVariables() {
		let self = this
		for (var key in self.STATE) {
			var value = self.STATE[key];

			self.setVariable(key, value)
		}
	}
}
