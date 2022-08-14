from flask import Flask, request, jsonify

"""
This is a file used to mock a Helo with a running API.
ALL variables can be set and retrieved using the API in /config
note that not all variables can act like this in the true API

To run:
python3 -m flask --app mock_helo run
"""


app = Flask(__name__)

state = {
    'eParamID_ReplicatorCommand' : 0,
    'eParamID_ReplicatorRecordState' : 0,
    'eParamID_ReplicatorStreamState' : 0,
    'eParamID_AVMute' : 0,
    'eParamID_RecordingProfileSel' : 1,
    'eParamID_LayoutSelector' : 1,
    'eParamID_FilenamePrefix' : ""
}

enums = {
    'eParamID_ReplicatorRecordState' :  {
        0: "eRRSUninitialized",
        1: "eRRSIdle",
        2: "eRRSRecording",
        3: "eRRSFailingInIdle",
        4: "eRRSFailingInRecord",
        5: "eRRSShutdown"
    },
    'eParamID_ReplicatorStreamState' :  {
        0: "eRRSUninitialized",
        1: "eRRSIdle",
        2: "eRRSStreaming",
        3: "eRRSFailingInIdle",
        4: "eRRSFailingInStream",
        5: "eRRSShutdown"
    }
}


@app.route('/')
def index():
    return 'Simple mock Helo that responds to replicator API commands.<br>See <a href="/config">Config</a>'

@app.route('/config', methods=['GET'])
def config():
    action = request.args.get('action') if 'action' in request.args else None
    paramId = request.args.get('paramid') if 'paramid' in request.args else None
    value = request.args.get('value') if 'value' in request.args else None

    global state

    if paramId not in state.keys():
        return f"Bad request: paramid must be {list(state.keys())}", 400
    if action == 'set':
        if paramId == 'eParamID_ReplicatorCommand':
            if int(value) not in range(0,10):
                return f"Bad request: value must be 0 - 9", 400
            value = int(value)
            if value == 1:
                state['eParamID_ReplicatorRecordState'] = 2
            if value == 2:
                state['eParamID_ReplicatorRecordState'] = 1
            if value == 3:
                state['eParamID_ReplicatorStreamState'] = 2
            if value == 4:
                state['eParamID_ReplicatorStreamState'] = 1
        if paramId in ['eParamID_ReplicatorRecordState','eParamID_ReplicatorStreamState']:
            if int(value) not in range(0,6):
                return f"Bad request: value must be 0 - 5", 400
        if paramId == 'eParamID_AVMute':
            if int(value) not in range(0,2):
                return f"Bad request: value must be 0 - 1", 400
        if paramId in ['eParamID_RecordingProfileSel','eParamID_LayoutSelector']:
            if int(value) not in range(1,11):
                return f"Bad request: value must be 1 - 10", 400

        if paramId == 'eParamID_FilenamePrefix':
            state[paramId] = value
        else:
            state[paramId] = int(value)
        return jsonify({'success':True}), 200, {'ContentType':'application/json'}
    elif action == 'get':
        if paramId in ['eParamID_ReplicatorRecordState','eParamID_ReplicatorStreamState']:
            return jsonify({
                "paramid":"2097225226", # leaving as record state, ignored
                "name":paramId,
                "value":state[paramId],
                "value_name":enums[paramId][state[paramId]]
            }), 200, {'ContentType':'application/json'}
        else:
            return jsonify({
            "name":paramId,
            "value":state[paramId],
            }), 200, {'ContentType':'application/json'}
    else:
        return "Bad request: action must be 'get' or 'set'", 400
