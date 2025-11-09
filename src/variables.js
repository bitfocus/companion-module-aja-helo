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
			{
				name: `Helo Variable Recording Duration`,
				variableId: `recording_duration`,
			},
			{
				name: `Helo Variable Streaming Duration`,
				variableId: `streaming_duration`,
			},
			{
				name: `Helo Variable Device Temperature (C)`,
				variableId: `device_temperature`,
			},
			{
				name: `Helo Variable Current Scheduler Event (If any)`,
				variableId: `scheduler_current_event`,
			},
			{
				name: `Helo Variable Next Scheduler Event (If any)`,
				variableId: `scheduler_next_event`,
			},
		])
	},

	checkVariables() {
		let self = this
		self.setVariableValues(self.STATE)
	},
}
