module.exports = {
	updateVariableDefinitions() {
		this.setVariableDefinitions([
			{
				name: `Recorder Status (Value)`,
				variableId: `recorder_status_value`,
			},
			{
				name: `Recorder Status`,
				variableId: `recorder_status`,
			},
			{
				name: `Stream Status (Value)`,
				variableId: `stream_status_value`,
			},
			{
				name: `Stream Status`,
				variableId: `stream_status`,
			},
			{
				name: `Available drive space (%)`,
				variableId: `storage_media_available`,
			},
			{
				name: `Helo Variable BeerGoggles`,
				variableId: `beer_goggles`,
			},
		])
	},

	checkVariables() {
		let self = this
		self.setVariableValues(self.STATE)
	},
}
