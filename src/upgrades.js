module.exports = [
	function v2_4_0(_context, _props) {
		var updateActions = []
		for (const action of _props.actions) {
			if (action.actionId === 'setProfile') {
				if (action.options.profileType === 'RecordingProfileSel&value=') {
					action.options.profileType = 'RecordingProfileSel'
				} else if (action.options.profileType === 'StreamingProfileSel&value=') {
					action.options.profileType = 'StreamingProfileSel'
				}
				if (action.options.profileNum) {
					action.options.recordingProfileNum = action.options.profileNum
					delete action.options.profileNum
					action.options.streamingProfileNum = 0
				}
				updateActions.push(action)
			}
			if (action.actionId === 'renameFileFromVariable ') {
				action.actionId = 'renameFile'
				if (action.options.name) {
					action.options.fileName = action.options.name
					delete action.options.name
				}
				updateActions.push(action)
			}
		}

		if (_props.config) {
			if (_props.config.name_refresh_rate === undefined) {
				_props.config.name_refresh_rate = 300000
			}
		}

		return {
			updatedConfig: _props.config,
			updatedActions: updateActions,
			updatedFeedbacks: [],
		}
	},
]
