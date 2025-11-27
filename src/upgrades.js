module.exports = [
	function v2_4_0(_context, _props) {
		var updateActions = []
		for (const action of _props.actions) {
			if (action.actionId === 'setProfile') {
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

		return {
			updatedConfig: null,
			updatedActions: updateActions,
			updatedFeedbacks: [],
		}
	},
]
