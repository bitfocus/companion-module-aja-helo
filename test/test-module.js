/**
 * Tests for the Companion AJA HELO module.
 * Can be run against a mock server or a real AJA HELO device.
 * To run against a real device, update the HOST and PORT constants to point to your device.
 *
 * !! Running tests against a real device WILL change its state and settings.
 * !! Recommend saving a copy of the device's settings before running tests against a real device.
 */

const actions = require('../src/actions.js')
const utils = require('../src/util.js')
const Helo = require('../src/Helo.js')

const { state, enums, server } = require('./mock/lyrebird.js')

const { describe, test, before, beforeEach, afterEach, after, mock } = require('node:test')
const assert = require('node:assert')

const http = require('node:http')

// Update the HOST and PORT constants to point to your AJA HELO device if you want to run tests against a real device.

const HOST = 'localhost'
const PORT = 8080

// MockModuleStartingState is a snapshot of the initial state of the module.

const MockModuleStartingState = {
	recorder_status_value: 0,
	recorder_status: 'eRRSUninitialized',
	stream_status_value: 0,
	stream_status: 'eRRSUninitialized',
	storage_media_available: 0,
	beer_goggles: 'No Beer...',
	recording_duration: '00:00:00:00',
	streaming_duration: '00:00:00:00',
	device_temperature: 0,
	scheduler_current_event: null,
	scheduler_next_event: null,
	LastNameUpdateTime: 0,
	RecordingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
	StreamingProfileNames: Array.from(Array(10)).map((e, i) => `${i + 1}`),
	LayoutNames: Array.from(Array(10)).map((e, i) => `Layout ${i + 1}`),
	PresetNames: Array.from(Array(20)).map((e, i) => `Preset #${i + 1}`),
}

// MockModule is a basic implementation of the Companion module that can be used for testing.
// It includes the required methods to properties used by actions.

class MockModule {
	constructor() {
		Object.assign(this, { ...actions, ...utils })

		this.config = {
			model: 'classic',
			host: 'localhost',
			port: 0,
			auth_required: false,
			auth_password: '',
		}

		this.setState()
	}

	async configUpdated(config) {
		this.config = config
	}

	async init(port) {
		this.config.port = port
		this.connection = new Helo(this, this.config)
	}

	async setActionDefinitions(actions) {
		this.actions = actions
		for (const name in actions) {
			this[name] = actions[name].callback
		}
	}

	updateStatus(status) {
		return
	}

	log(level, message) {
		console.log(`[${level.toUpperCase()}] ${message}`)
	}

	setState() {
		this.STATE = structuredClone(MockModuleStartingState)
	}
}

describe('Companion AJA HELO Module', { concurrency: 1 }, () => {
	let port
	let baseUrl
	let companionModule
	let delay = 0
	const DefaultState = structuredClone(state)

	function request(url, method = 'GET') {
		return new Promise((resolve, reject) => {
			const options = {
				method: method,
			}
			const req = http.request(`${baseUrl}${url}`, options, (res) => {
				let data = ''
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					resolve({ statusCode: res.statusCode, body: data })
				})
			})
			req.on('error', (err) => {
				reject(err)
			})
			req.end()
		})
	}

	before(async () => {
		companionModule = new MockModule()
		if (HOST === 'localhost') {
			// Start the server before running tests
			await new Promise((resolve) => server.listen(0, resolve))
			port = server.address().port
			baseUrl = `http://${HOST}:${port}`
		} else {
			// IF Running Tests Against a Real Device
			port = PORT
			baseUrl = `http://${HOST}:${port}`
			// Manuall assign host
			companionModule.config.host = HOST
			// Add a delay to allow the device to process requests
			delay = 1000
		}
		await companionModule.init(port)
		await companionModule.updateActions()
	})

	beforeEach(() => {
		companionModule.config.model = 'classic'
		companionModule.updateActions()
		// Reset the state before each test
		Object.assign(state, DefaultState)
		companionModule.setState()
		// Add 999 to each int value to ensure module setting to '0' or '1' is actually changing the value
		for (const key in state) {
			if (typeof state[key] === 'number') {
				state[key] += 999
			}
			if (typeof state[key] === 'string') {
				state[key] = `999-${state[key]}`
			}
		}
	})

	after(() => {
		// Stop the server after all tests are done
		server.close()
	})

	afterEach(async () => {
		mock.reset()
		if (delay > 0) {
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
	})

	test('Module initializes correctly', async (t) => {
		assert.strictEqual(companionModule.config.host, 'localhost')
		assert.strictEqual(companionModule.config.port, port)
		assert.strictEqual(companionModule.config.auth_required, false)
		assert.strictEqual(companionModule.config.auth_password, '')
	})

	test('action: Record / Stream Control - Start Recording', async (t) => {
		await companionModule.startStop({ options: { command: 'ReplicatorCommand&value=1' } })
		assert.strictEqual(state.eParamID_ReplicatorRecordState, 2)
	})

	test('action: Record / Stream Control - Stop Recording', async (t) => {
		await companionModule.startStop({ options: { command: 'ReplicatorCommand&value=2' } })
		assert.strictEqual(state.eParamID_ReplicatorRecordState, 1)
	})

	test('action: Record / Stream Control - Start Streaming', async (t) => {
		await companionModule.startStop({ options: { command: 'ReplicatorCommand&value=3' } })
		assert.strictEqual(state.eParamID_ReplicatorStreamState, 2)
	})

	test('action: Record / Stream Control - Stop Streaming', async (t) => {
		await companionModule.startStop({ options: { command: 'ReplicatorCommand&value=4' } })
		assert.strictEqual(state.eParamID_ReplicatorStreamState, 1)
	})

	test('action: Toggle Recording [off -> on]', async (t) => {
		await companionModule.toggleRecord()
		assert.strictEqual(state.eParamID_ReplicatorRecordState, 2)
	})

	test('action: Toggle Recording [on -> off]', async (t) => {
		state.eParamID_ReplicatorRecordState = 2
		companionModule.STATE.recorder_status_value = 2
		await companionModule.toggleRecord()
		assert.strictEqual(state.eParamID_ReplicatorRecordState, 1)
	})

	test('action: Toggle Streaming [off -> on]', async (t) => {
		await companionModule.toggleStream()
		assert.strictEqual(state.eParamID_ReplicatorStreamState, 2)
	})

	test('action: Toggle Streaming [on -> off]', async (t) => {
		state.eParamID_ReplicatorStreamState = 2
		companionModule.STATE.stream_status_value = 2
		await companionModule.toggleStream()
		assert.strictEqual(state.eParamID_ReplicatorStreamState, 1)
	})

	for (const { id, label } of [
		{ id: 'VideoInSelect&value=0', label: 'SDI' },
		{ id: 'VideoInSelect&value=1', label: 'HDMI' },
		{ id: 'VideoInSelect&value=2', label: 'Test Pattern' },
	]) {
		test(`action: Set Video Input - ${label}`, async (t) => {
			await companionModule.videoInSelect({ options: { input: id } })
			assert.strictEqual(state.eParamID_VideoInSelect, parseInt(id.split('=')[1]))
		})
	}

	for (const { id, label } of [
		{ id: 'AudioInSelect&value=0', label: 'SDI' },
		{ id: 'AudioInSelect&value=1', label: 'HDMI' },
		{ id: 'AudioInSelect&value=2', label: 'Analog' },
		{ id: 'AudioInSelect&value=4', label: 'None' },
	]) {
		test(`action: Set Audio Input - ${label}`, async (t) => {
			await companionModule.audioInSelect({ options: { input: id } })
			assert.strictEqual(state.eParamID_AudioInSelect, parseInt(id.split('=')[1]))
		})
	}

	for (const { id, label } of [
		{ id: 'AnalogAudioInputLevel&value=0', label: '0dB' },
		{ id: 'AnalogAudioInputLevel&value=1', label: '+6dB' },
		{ id: 'AnalogAudioInputLevel&value=2', label: '+12dB' },
	]) {
		test(`action: Set Analog Audio Input Level - ${label}`, async (t) => {
			await companionModule.analogAudioInputLevel({ options: { level: id } })
			assert.strictEqual(state.eParamID_AnalogAudioInputLevel, parseInt(id.split('=')[1]))
		})
	}

	for (const delay of [0, 300, 100, 150, 200]) {
		test(`action: Set Audio Delay - ${delay}ms`, async (t) => {
			await companionModule.audioDelay({ options: { audioDelay: delay } })
			assert.strictEqual(state.eParamID_DelayAudioMs, delay)
		})
	}

	test('action: Mute (Audio)', async (t) => {
		await companionModule.mute()
		assert.strictEqual(state.eParamID_AVMute, 1)
	})

	test('action: Unmute (Audio)', async (t) => {
		await companionModule.unmute()
		assert.strictEqual(state.eParamID_AVMute, 0)
	})

	test('action: Reboot Device', async (t) => {
		await companionModule.reboot()
		assert.strictEqual(state.eParamID_Reboot, 1)
	})

	test('action: Rename File', async (t) => {
		await companionModule.renameFile({ options: { fileName: 'new_file_name' } })
		assert.strictEqual(state.eParamID_FilenamePrefix, 'new_file_name')
	})

	test('action: Rename File - Timestamp', async (t) => {
		await companionModule.renameFileTs()
		let ts = companionModule.renameTimestamp()
		// ts doesn't include seconds so should be ok to compare
		assert.strictEqual(state.eParamID_FilenamePrefix, ts)
	})

	for (const { id, label } of Array.from(Array(MockModuleStartingState.PresetNames.length)).map((e, i) => {
		return { id: i + 1, label: MockModuleStartingState.PresetNames[i] }
	})) {
		test(`action: Recall Preset - ${label}`, async (t) => {
			await companionModule.recallPreset({ options: { layout: id } })
			const result = await companionModule.connection.sendRequest('action=get&paramid=eParamID_RegisterRecallResult')
			assert.strictEqual(result['response']['value_name'], 'Complete')
		})
	}

	test('action: Erase All Clips', async (t) => {
		await companionModule.eraseAllClips()
		// TODO: Add validation
	})

	for (const { id, label } of [
		{ id: 'SchedulerEnabled&value=0', label: 'Disabled' },
		{ id: 'SchedulerEnabled&value=1', label: 'Enabled' },
	]) {
		test(`action: Scheduler Control - ${label}`, async (t) => {
			await companionModule.schedulerEnabled({ options: { enabled: id } })
			assert.strictEqual(state.eParamID_SchedulerEnabled, parseInt(id.split('=')[1]))
		})
	}

	for (const { id, label } of [
		{ id: 'SchedulerActivity&value=1', label: 'Record Only' },
		{ id: 'SchedulerActivity&value=2', label: 'Stream Only' },
		{ id: 'SchedulerActivity&value=3', label: 'Record and Stream' },
	]) {
		test(`action: Scheduler Activity - ${label}`, async (t) => {
			await companionModule.schedulerActivity({ options: { activity: id } })
			assert.strictEqual(state.eParamID_SchedulerActivity, parseInt(id.split('=')[1]))
		})
	}

	// Primary Recording Destination
	for (const { id, label } of [
		{ id: 'RecordingDestination&value=0', label: 'SD' },
		{ id: 'RecordingDestination&value=1', label: 'USB' },
		{ id: 'RecordingDestination&value=2', label: 'SMB Network Share' },
		{ id: 'RecordingDestination&value=3', label: 'NFS Network Share' },
	]) {
		test(`action: Set Recording Destination - Primary - ${label}`, async (t) => {
			await companionModule.recordingDestination({ options: { destination: id, type: 'Primary' } })
			assert.strictEqual(state[`eParamID_RecordingDestination`], parseInt(id.split('=')[1]))
		})
	}
	// Secondary Recording Destination
	for (const { id, label } of [
		{ id: 'SecondaryRecordingDestination&value=4', label: 'None' },
		{ id: 'SecondaryRecordingDestination&value=0', label: 'SD' },
		{ id: 'SecondaryRecordingDestination&value=1', label: 'USB' },
	]) {
		test(`action: Set Recording Destination - Secondary - ${label}`, async (t) => {
			await companionModule.recordingDestination({ options: { destinationSecondary: id, type: 'Secondary' } })
			assert.strictEqual(state[`eParamID_SecondaryRecordingDestination`], parseInt(id.split('=')[1]))
		})
	}

	// IF companionModule.config.model === 'classic' || companionModule.config.model === undefined
	// Record Profiles
	for (const { id, label } of Array.from(Array(10)).map((e, i) => {
		return { id: i.toString(), label: MockModuleStartingState.RecordingProfileNames[i] }
	})) {
		test(`action: Choose Profiles - Recording - ${label}`, async (t) => {
			await companionModule.setProfile({
				options: { profileType: 'RecordingProfileSel', recordingProfileNum: id },
			})
			assert.strictEqual(state[`eParamID_RecordingProfileSel`], parseInt(id))
		})
	}
	// Stream Profiles
	for (const { id, label } of Array.from(Array(10)).map((e, i) => {
		return { id: i.toString(), label: MockModuleStartingState.StreamingProfileNames[i] }
	})) {
		test(`action: Choose Profiles - Streaming - ${label}`, async (t) => {
			await companionModule.setProfile({
				options: { profileType: 'StreamingProfileSel', streamingProfileNum: id },
			})
			assert.strictEqual(state[`eParamID_StreamingProfileSel`], parseInt(id))
		})
	}
	// END IF
	// IF companionModule.config.model === 'plus'
	describe('Companion AJA HELO Module - Plus Model', { concurrency: 1 }, () => {
		beforeEach(() => {
			companionModule.config.model = 'plus'
			companionModule.updateActions()
		})

		for (const { id, label } of Array.from(Array(MockModuleStartingState.LayoutNames.length)).map((e, i) => {
			return { id: i + 1, label: MockModuleStartingState.LayoutNames[i] }
		})) {
			test(`action: Select Layout - ${label}`, async (t) => {
				await companionModule.selectLayout({ options: { layout: id } })
				assert.strictEqual(state[`eParamID_LayoutSelector`], parseInt(id))
			})
		}

		for (const { id, label } of Array.from(Array(MockModuleStartingState.LayoutNames.length)).map((e, i) => {
			return { id: i + 1, label: MockModuleStartingState.LayoutNames[i] }
		})) {
			for (const { id: id2, label: label2 } of [
				{ id: '0', label: 'None' },
				{ id: '1', label: 'Recall' },
				//{ id: '2', label: 'Store'},
				{ id: '3', label: 'Template' },
			]) {
				test(`action: Select Layout and Recall/Load Template - ${label} - ${label2}`, async (t) => {
					t.mock.timers.enable() // Enable fake timers for this test
					await companionModule.selectLayoutAndDo({ options: { layout: id, action: id2 } })
					assert.strictEqual(state[`eParamID_LayoutSelector`], parseInt(id))
				})
			}

			test('action: Recall Selected Layout', async (t) => {
				state.eParamID_LayoutSelector = 2
				await companionModule.recallSelectedLayout()
				assert.strictEqual(state[`eParamID_LayoutCommand`], 1)
			})
		}
	})
	// END IF
})
