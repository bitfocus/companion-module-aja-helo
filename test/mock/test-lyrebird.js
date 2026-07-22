/**
 * Test suite for the mock Lyrebird server.
 */

const { state, enums, server } = require('./lyrebird.js')

const { describe, test, before, beforeEach, afterEach, after, mock } = require('node:test')
const assert = require('node:assert')

const http = require('node:http')

describe('Mock AJA HELO', { concurrency: 1 }, () => {
	let port
	let baseUrl
	const DefaultState = structuredClone(state)

	function request(url, method = 'GET', body = null, headers = {}) {
		return new Promise((resolve, reject) => {
			const options = {
				method: method,
				headers: headers,
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
			if (body) {
				req.write(body)
			}
			req.end()
		})
	}

	function testBounds(paramid, lowerBound, upperBound) {
		test(`SET ${paramid} to lower bound (${lowerBound}) returns 200`, async (t) => {
			const response = await request(`/config?action=set&paramid=${paramid}&value=${lowerBound}`)
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state[paramid], lowerBound)
		})

		test(`SET ${paramid} below lower bound (${lowerBound}) returns 400`, async (t) => {
			const response = await request(`/config?action=set&paramid=${paramid}&value=${lowerBound - 1}`)
			assert.strictEqual(response.statusCode, 400)
		})

		test(`SET ${paramid} to upper bound (${upperBound}) returns 200`, async (t) => {
			const response = await request(`/config?action=set&paramid=${paramid}&value=${upperBound}`)
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state[paramid], upperBound)
		})

		test(`SET ${paramid} above upper bound (${upperBound}) returns 400`, async (t) => {
			const response = await request(`/config?action=set&paramid=${paramid}&value=${upperBound + 1}`)
			assert.strictEqual(response.statusCode, 400)
		})

		test(`SET ${paramid} to text value returns 400`, async (t) => {
			const response = await request(`/config?action=set&paramid=${paramid}&value=text`)
			assert.strictEqual(response.statusCode, 400)
		})
	}

	before(async () => {
		// Start the server before running tests
		await new Promise((resolve) => server.listen(0, resolve))
		port = server.address().port
		baseUrl = `http://localhost:${port}`
	})

	beforeEach(() => {
		// Reset the state before each test
		Object.assign(state, DefaultState)
	})

	after(() => {
		// Stop the server after all tests are done
		server.close()
	})

	afterEach(() => {
		mock.reset()
	})

	test('State should be initialized correctly', (t) => {
		assert.deepStrictEqual(state, DefaultState)
	})

	test('GET / (index page) returns 200', async (t) => {
		const response = await request('/')
		assert.strictEqual(response.statusCode, 200)
		const HTMLContent = `Simple mock Helo that responds to replicator API commands.<br>See <a href="/config">Config</a>`
		assert.strictEqual(response.body, HTMLContent)
	})

	// Bad API Calls //
	test('GET /config with missing paramid returns 400', async (t) => {
		const response = await request('/config?action=get')
		assert.strictEqual(response.statusCode, 400)
	})

	test('GET /config with invalid paramid returns 400', async (t) => {
		const response = await request('/config?action=get&paramid=invalid_param')
		assert.strictEqual(response.statusCode, 400)
	})

	test('GET /config with invalid action returns 400', async (t) => {
		const response = await request('/config?action=invalid&paramid=some_param')
		assert.strictEqual(response.statusCode, 400)
	})

	test('GET /invalid_endpoint returns 404', async (t) => {
		const response = await request('/invalid_endpoint')
		assert.strictEqual(response.statusCode, 404)
	})

	test('POST /config returns 405 (Method Not Allowed)', async (t) => {
		const response = await request('/config?action=get&paramid=some_param', 'POST')
		assert.strictEqual(response.statusCode, 405)
	})

	// // GET API //
	for (const key of Object.keys(DefaultState)) {
		test('GET /config returns the correct state for ' + key, async (t) => {
			const response = await request(`/config?action=get&paramid=${key}`)
			assert.strictEqual(response.statusCode, 200)
			const config = JSON.parse(response.body)
			let valueName = key in enums ? enums[key][state[key]] : DefaultState[key]
			const expectedValue = {
				paramid: '2097225226', // Hardcoded value for testing purposes
				name: key,
				value: DefaultState[key],
				value_name: valueName,
			}
			assert.deepStrictEqual(config, expectedValue)
		})
	}

	// SET API //
	describe('SET API', () => {
		beforeEach(() => {
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
		// eParamID_ReplicatorCommand
		test('SET eParamID_ReplicatorCommand to start Recording', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=1')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_ReplicatorRecordState, 2)
		})

		test('SET eParamID_ReplicatorCommand to stop Recording', async (t) => {
			// First, set the state to recording
			state.eParamID_ReplicatorRecordState = 2

			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=2')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_ReplicatorRecordState, 1)
		})

		test('SET eParamID_ReplicatorCommand to start Streaming', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=3')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_ReplicatorStreamState, 2)
		})

		test('SET eParamID_ReplicatorCommand to stop Streaming', async (t) => {
			// First, set the state to streaming
			state.eParamID_ReplicatorStreamState = 2

			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=4')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_ReplicatorStreamState, 1)
		})

		test('SET eParamID_ReplicatorCommand to invalid upper bound returns 400', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=999')
			assert.strictEqual(response.statusCode, 400)
		})

		test('SET eParamID_ReplicatorCommand to invalid lower bound returns 400', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=-1')
			assert.strictEqual(response.statusCode, 400)
		})

		test('SET eParamID_ReplicatorCommand with text value returns 400', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorCommand&value=text')
			assert.strictEqual(response.statusCode, 400)
		})

		// eParamID_ReplicatorRecordState and eParamID_ReplicatorStreamState are read-only
		test('SET eParamID_ReplicatorRecordState returns 400 (read-only)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorRecordState&value=2')
			assert.strictEqual(response.statusCode, 400)
		})

		test('SET eParamID_ReplicatorStreamState returns 400 (read-only)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_ReplicatorStreamState&value=2')
			assert.strictEqual(response.statusCode, 400)
		})

		// AV Mute
		testBounds('eParamID_AVMute', 0, 1)

		// Layout Select
		testBounds('eParamID_LayoutSelector', 1, 10)

		// Filename Prefix
		test('SET eParamID_FilenamePrefix to a valid string', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_FilenamePrefix&value=TestPrefix')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_FilenamePrefix, 'TestPrefix')
		})

		test('SET eParamID_FilenamePrefix to an empty string returns 200', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_FilenamePrefix&value=')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_FilenamePrefix, '')
		})

		// Current Media Available (read-only)
		test('SET eParamID_CurrentMediaAvailable returns 400 (read-only)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_CurrentMediaAvailable&value=1')
			assert.strictEqual(response.statusCode, 400)
		})

		// Video Input Select
		testBounds('eParamID_VideoInSelect', 0, 3)

		// Audio Input Select
		testBounds('eParamID_AudioInSelect', 0, 2)
		test('SET eParamID_AudioInSelect to None (4)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_AudioInSelect&value=4')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_AudioInSelect, 4)
		})

		// Audio Delay (ms)
		testBounds('eParamID_DelayAudioMs', 0, 300)
		// Analog Audio Input Level
		testBounds('eParamID_AnalogAudioInputLevel', 0, 2)

		// Beer Goggles
		testBounds('eParamID_BeerGoggles', 0, 1)

		// Reboot
		test('SET eParamID_Reboot', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_Reboot&value=1')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_Reboot, 1)

			// Subsequent requests should return 503 Service Unavailable
			const responseAfterReboot = await request('/config?action=get&paramid=eParamID_AVMute')
			assert.strictEqual(responseAfterReboot.statusCode, 503)
		})

		// Streaming and Recording Profiles
		;['Streaming', 'Recording'].forEach((p) => {
			for (let i = 1; i <= 1; i++) {
				test(`SET eParamID_${p}ProfileName_${i} to valid string returns 200`, async (t) => {
					const response = await request(`/config?action=set&paramid=eParamID_${p}ProfileName_${i}&value=Profile${i}`)
					assert.strictEqual(response.statusCode, 200)
					assert.strictEqual(state[`eParamID_${p}ProfileName_${i}`], `Profile${i}`)
				})

				test(`SET eParamID_${p}ProfileName_${i} to empty string returns 200`, async (t) => {
					const response = await request(`/config?action=set&paramid=eParamID_${p}ProfileName_${i}&value=`)
					assert.strictEqual(response.statusCode, 200)
					assert.strictEqual(state[`eParamID_${p}ProfileName_${i}`], '')
				})
			}
		})

		// Register Recall Result (read-only)
		test('SET eParamID_RegisterRecallResult returns 400 (read-only)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_RegisterRecallResult&value=1')
			assert.strictEqual(response.statusCode, 400)
		})

		// Register Recall
		testBounds('eParamID_RegisterRecall', 0, 20)
		test('SET eParamID_RegisterRecall configures eParamID_RegisterRecallResult', async (t) => {
			t.mock.timers.enable() // Enable fake timers for this test
			const response = await request('/config?action=set&paramid=eParamID_RegisterRecall&value=1')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_RegisterRecall, 1)
			assert.strictEqual(state.eParamID_RegisterRecallResult, 2)
			// Wait for the simulated delay to complete
			t.mock.timers.tick(7000) // Fast-forward time by 7 seconds
			assert.strictEqual(state.eParamID_RegisterRecallResult, 0) // Should reset after delay
		})

		// Scheduler Enabled
		testBounds('eParamID_SchedulerEnabled', 0, 1)

		// Scheduler Activity
		testBounds('eParamID_SchedulerActivity', 1, 3)

		// Recording Destination
		testBounds('eParamID_RecordingDestination', 0, 3)

		// Secondary Recording Destination
		testBounds('eParamID_SecondaryRecordingDestination', 0, 1)
		test('SET eParamID_SecondaryRecordingDestination to None (4)', async (t) => {
			const response = await request('/config?action=set&paramid=eParamID_SecondaryRecordingDestination&value=4')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_SecondaryRecordingDestination, 4)
		})

		// Recording Profile Select
		testBounds('eParamID_RecordingProfileSel', 0, 9)

		// Streaming Profile Select
		testBounds('eParamID_StreamingProfileSel', 0, 9)

		// Layout Command
		testBounds('eParamID_LayoutCommand', 0, 3)
		test('SET eParamID_LayoutCommand resets after time', async (t) => {
			t.mock.timers.enable() // Enable fake timers for this test
			const response = await request('/config?action=set&paramid=eParamID_LayoutCommand&value=1')
			assert.strictEqual(response.statusCode, 200)
			assert.strictEqual(state.eParamID_LayoutCommand, 1)
			// Wait for the simulated delay to complete
			t.mock.timers.tick(2500) // Fast-forward time by 2.5 seconds
			assert.strictEqual(state.eParamID_LayoutCommand, 0) // Should reset after delay
		})

		// Test Clips
		test('POST /clips returns 200 if valid JSON', async (t) => {
			const response = await request(
				'/clips',
				'POST',
				JSON.stringify({
					action: 'delete',
					recdest: '0',
					clipname: '*',
				})
			)
			assert.strictEqual(response.statusCode, 200)
		})

		test('POST /clips returns 400 if invalid JSON', async (t) => {
			const response = await request('/clips', 'POST', '{ invalid json }')
			assert.strictEqual(response.statusCode, 400)
		})

		test('POST /clips returns 400 if missing required fields', async (t) => {
			const response = await request('/clips', 'POST', JSON.stringify({ action: 'delete' }))
			assert.strictEqual(response.statusCode, 400)
		})
	})
})
