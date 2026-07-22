/**
 * lyrebird.js - A Mock Helo Server
 * This server simulates the behavior of a Helo device for testing purposes.
 * It responds to GET and POST requests to mimic the Helo's API.
 *
 * This mock implementation is not designed to be a complete replica of the Helo's functionality,
 * but rather to provide a basic framework for testing interactions with the Helo API.
 * Certain interactions may differ to the actual device and testing should always be done with a real Helo device..
 */

const http = require('node:http')

let state = {
	eParamID_ReplicatorCommand: 0,
	eParamID_ReplicatorRecordState: 0,
	eParamID_ReplicatorStreamState: 0,
	eParamID_AVMute: 0,
	eParamID_LayoutSelector: 1,
	eParamID_FilenamePrefix: '',
	eParamID_CurrentMediaAvailable: 0,
	eParamID_VideoInSelect: 0,
	eParamID_AudioInSelect: 0,
	eParamID_DelayAudioMs: 0,
	eParamID_AnalogAudioInputLevel: 0,
	eParamID_BeerGoggles: 0,
	eParamID_Reboot: 0,
	eParamID_RegisterRecall: 0,
	eParamID_RegisterRecallResult: 0,
	eParamID_SchedulerEnabled: 0,
	eParamID_SchedulerActivity: 1,
	eParamID_RecordingDestination: 0,
	eParamID_SecondaryRecordingDestination: 0,
	eParamID_RecordingProfileSel: 0,
	eParamID_StreamingProfileSel: 0,
	eParamID_LayoutCommand: 0,
	eParamID_LayoutSelector: 1,
}

const profileState = {}
;['Streaming', 'Recording'].forEach((t) => {
	for (let i = 1; i <= 10; i++) {
		state[`eParamID_${t}ProfileName_${i}`] = `${t} Profile Name ${i}`
	}
})

state = {
	...state,
	...profileState,
}

const DefaultState = structuredClone(state)

// Define enums for various parameters
const enums = {
	eParamID_ReplicatorRecordState: {
		0: 'eRRSUninitialized',
		1: 'eRRSIdle',
		2: 'eRRSRecording',
		3: 'eRRSFailingInIdle',
		4: 'eRRSFailingInRecord',
		5: 'eRRSShutdown',
	},
	eParamID_ReplicatorStreamState: {
		0: 'eRRSUninitialized',
		1: 'eRRSIdle',
		2: 'eRRSStreaming',
		3: 'eRRSFailingInIdle',
		4: 'eRRSFailingInStream',
		5: 'eRRSShutdown',
	},
	eParamID_VideoInSelect: { 0: 'SDI', 1: 'HDMI', 2: 'Test Pattern' },
	eParamID_AudioInSelect: { 0: 'SDI', 1: 'HDMI', 2: 'Analog', 3: '', 4: 'None' },
	eParamID_AnalogAudioInputLevel: { 0: '0dB', 1: '+6dB', 2: '+12dB' },
	eParamID_BeerGoggles: { 0: 'No Beer...', 1: 'Beer Thirty!' },
	eParamID_SchedulerEnabled: { 0: 'Disabled', 1: 'Enabled' },
	eParamID_SchedulerActivity: { 1: 'Record Only', 2: 'Stream Only', 3: 'Record and Stream' },
	eParamID_RecordingDestination: {
		0: 'SD',
		1: 'USB',
		2: 'SMB Network Share',
		3: 'NFS Network Share',
	},
	eParamID_SecondaryRecordingDestination: {
		4: 'None',
		0: 'SD',
		1: 'USB',
	},
	eParamID_RegisterRecallResult: { 0: '', 1: 'Recalling...', 2: 'Complete', 4: 'Preset Empty', 3: 'Recall Failed' },
}

const server = http.createServer((req, res) => {
	// Parse url and method

	const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
	const url = parsedUrl.pathname
	const { method } = req

	const queryParams = Object.fromEntries(parsedUrl.searchParams.entries())

	// Main Page //
	// Return a simple welcome message
	if (url === '/' && method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' })
		res.end('Simple mock Helo that responds to replicator API commands.<br>See <a href="/config">Config</a>')
	}
	// /config //
	// Main Page for configuration
	else if (url === '/config' && method === 'GET') {
		let action = queryParams.action
		let paramId = queryParams.paramid
		let value = queryParams.value

		// Don't allow any operations if the device is in reboot state
		// We don't really need to mock this but why not? :)
		if (state['eParamID_Reboot'] === 1) {
			res.writeHead(503, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: 'Service Unavailable' }))
			return
		}

		// Error handling for invalid paramId
		if (paramId === null || paramId === undefined || !(paramId in state)) {
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: `Parameter ID '${paramId}' not found` }))
			return
		}
		// Retrieve the value of a parameter
		if (action === 'get') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			let valueName = paramId in enums ? enums[paramId][state[paramId]] : state[paramId]
			res.end(
				JSON.stringify({
					// a unique number identifying the parameter upon which the operation was requested.
					paramid: '2097225226',
					// the developer-friendly name of the parameter upon which the operation was requested.
					name: paramId,
					// the value of the parameter
					value: state[paramId],
					/*
					 * the a text representation of the value.
					 * For 'enum' type parameters,
					 *  this is the "text" corresponding to the "value" in the Descriptor's "enum_values" list.
					 *
					 * For 'integer' type params,
					 *  it's just a duplicate of the "value".
					 */
					value_name: valueName,
				})
			)
			return
		}
		// Set the value of a parameter
		else if (action === 'set') {
			if (!paramId || value === null || value === undefined || typeof value !== 'string') {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: paramId and value are required' }))
				return
			}
			// check if string parameter, if so, set it directly, otherwise validate and set integer parameter
			if (paramId === 'eParamID_FilenamePrefix' || /eParamID_(Streaming|Recording)ProfileName_\d+/.test(paramId)) {
				state[paramId] = queryParams.value
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ success: true }))
				return
			}
			if (!(Number.isInteger(Number(value)) && value.trim() !== '')) {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: value must be an integer' }))
				return
			}
			value = parseInt(value)

			// Bound Checks for specific parameters
			if (paramId === 'eParamID_ReplicatorCommand') {
				if (value < 0 || value >= 6) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 5' }))
					return
				}
				if (value === 1) {
					// Start Recording
					state['eParamID_ReplicatorRecordState'] = 2
				}
				if (value === 2) {
					// Stop Recording
					state['eParamID_ReplicatorRecordState'] = 1
				}
				if (value === 3) {
					// Start Streaming
					state['eParamID_ReplicatorStreamState'] = 2
				}
				if (value === 4) {
					// Stop Streaming
					state['eParamID_ReplicatorStreamState'] = 1
				}
			}
			if (paramId === 'eParamID_RegisterRecall') {
				if (value < 0 || value > 20) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 20' }))
					return
				}
				// Simulate a register recall operation
				state['eParamID_RegisterRecallResult'] = 2 // Assume complete success for this mock
				setTimeout(() => {
					state['eParamID_RegisterRecallResult'] = 0 // Reset after some time
				}, 5000) // Simulate a delay of 5 seconds for the recall operation
			}
			if (paramId === 'eParamID_RegisterRecallResult') {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: this parameter is Read-Only' }))
				return
			}
			if (paramId === 'eParamID_LayoutCommand') {
				if (value < 0 || value > 3) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 3' }))
					return
				}
				// Simulate a layout command operation
				setTimeout(() => {
					state['eParamID_LayoutCommand'] = 0 // Reset after some time
				}, 2000)
			}
			if (['eParamID_ReplicatorRecordState', 'eParamID_ReplicatorStreamState'].includes(paramId)) {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: this parameter is Read-Only' }))
				return
			}
			if (['eParamID_AVMute', 'eParamID_BeerGoggles'].includes(paramId)) {
				if (value < 0 || value >= 2) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 1' }))
					return
				}
			}
			if (paramId === 'eParamID_LayoutSelector') {
				if (value < 1 || value > 10) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 1 - 10' }))
					return
				}
			}
			if (paramId === 'eParamID_CurrentMediaAvailable') {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: this parameter is Read-Only' }))
				return
			}
			if (paramId === 'eParamID_VideoInSelect') {
				if (value < 0 || value >= 4) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 3' }))
					return
				}
			}
			if (paramId === 'eParamID_AudioInSelect') {
				if (value < 0 || (value >= 3 && value !== 4)) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 2 or 4' }))
					return
				}
			}
			if (paramId === 'eParamID_AnalogAudioInputLevel') {
				if (value < 0 || value >= 3) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 2' }))
					return
				}
			}
			if (paramId === 'eParamID_DelayAudioMs') {
				if (value < 0 || value > 300) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 300' }))
					return
				}
			}
			if (paramId === 'eParamID_SchedulerEnabled') {
				if (value < 0 || value > 1) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 or 1' }))
					return
				}
			}
			if (paramId === 'eParamID_SchedulerActivity') {
				if (value < 1 || value > 3) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 1 - 3' }))
					return
				}
			}
			if (paramId === 'eParamID_RecordingDestination') {
				if (value < 0 || value > 3) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 3' }))
					return
				}
			}
			if (paramId === 'eParamID_SecondaryRecordingDestination') {
				if (value < 0 || (value > 1 && value !== 4)) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 1 or 4' }))
					return
				}
			}
			if (paramId === 'eParamID_StreamingProfileSel' || paramId === 'eParamID_RecordingProfileSel') {
				if (value < 0 || value > 9) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 0 - 9' }))
					return
				}
			}
			if (paramId === 'eParamID_Reboot') {
				if (value !== 1) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: value must be 1 to trigger reboot' }))
					return
				}
				// add async reboot simulation
				setTimeout(() => {
					state = structuredClone(DefaultState)
				}, 5000) // Simulate a reboot delay of 5 seconds
			}
			// Validation passed, set the value
			state[paramId] = value
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ success: true }))
			return
		} else {
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: "Bad request: action must be 'get' or 'set'" }))
			return
		}
	} else if (url === '/clips' && method === 'POST') {
		// handle clip delete
		let body = ''
		req.on('data', (chunk) => {
			body += chunk.toString()
		})
		req.on('end', () => {
			try {
				const data = JSON.parse(body)
				const { action, recdest, clipname } = data

				if (!action || !recdest || !clipname) {
					res.writeHead(400, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'Bad request: action, recdest, and clipname are required' }))
					return
				}

				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ success: true }))
			} catch (e) {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Bad request: invalid JSON' }))
			}
		})
		return
	} else if (method !== 'GET') {
		res.writeHead(405, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({ error: 'Method Not Allowed' }))
	}
	// 404 Not Found fallback
	else {
		res.writeHead(404, { 'Content-Type': 'application/json' })
		res.end(JSON.stringify({ error: 'Route not found' }))
	}
})

if (require.main === module) {
	const PORT = 3000
	server.listen(PORT, () => {
		console.log(`Mock Helo server is running on http://localhost:${PORT}`)
	})
}

module.exports = {
	state,
	enums,
	server,
}
