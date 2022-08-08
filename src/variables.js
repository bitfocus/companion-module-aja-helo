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
				label: `Recording Status`,
				name: `recording_status`,
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
				label: `Streaming Status`,
				name: `streaming_status`,
			},
		])
	},
}
