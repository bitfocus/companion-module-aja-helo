module.exports = {
    // ##########################
    // #### Define Feedbacks ####
    // ##########################
    feedbacks() {
        let self = this;
        const feedbacks = {};

        const foregroundColorWhite = self.rgb(255, 255, 255) // White
        const foregroundColorBlack = self.rgb(0, 0, 0) // Black
        const backgroundColorRed = self.rgb(255, 0, 0) // Red
        const backgroundColorGreen = self.rgb(0, 255, 0) // Green
        const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

        feedbacks['recordStatus'] = {
            type: 'boolean',
            label: 'Show Record Status On Button',
            description: 'Indicate if Helo is Recording',
            style: {
                color: foregroundColorBlack,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 1,
                    choices: [
                        { id: 0, label: 'Idle' },
                        { id: 1, label: 'Recording' },
                        { id: 2, label: 'Failed' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;
                let errsStatus = []
                switch (opt.status) {
                    case 0:
                        // Add uninit, idle, shutdown
                        errsStatus.push(0, 1, 5)
                        break;
                    case 1:
                        // add record status
                        errsStatus.push(2)
                        break;
                    case 2:
                        // add both failed in idle and record
                        errsStatus.push(3, 4)
                        break;
                }
                if (self.recordStatus !== -1) {
                    if (errsStatus.includes(self.recordStatus)) {
                        return true;
                    }
                }
                return false
            }
        }

        feedbacks['streamStatus'] = {
            type: 'boolean',
            label: 'Show Stream Status On Button',
            description: 'Indicate if Helo is Streaming',
            style: {
                color: foregroundColorBlack,
                bgcolor: backgroundColorRed,
            },
            options: [
                {
                    type: 'dropdown',
                    label: 'Indicate in X Status',
                    id: 'status',
                    default: 1,
                    choices: [
                        { id: 0, label: 'Idle' },
                        { id: 1, label: 'Streaming' },
                        { id: 2, label: 'Failed' }
                    ]
                }
            ],
            callback: function (feedback) {
                let opt = feedback.options;
                let errsStatus = []
                switch (opt.status) {
                    case 0:
                        // Add uninit, idle, shutdown
                        errsStatus.push(0, 1, 5)
                        break;
                    case 1:
                        // add stream status
                        errsStatus.push(2)
                        break;
                    case 2:
                        // add both failed in idle and stream
                        errsStatus.push(3, 4)
                        break;
                }
                if (self.streamStatus !== -1) {
                    if (errsStatus.includes(self.streamStatus)) {
                        return true;
                    }
                }
                return false
            }
        }
        self.setFeedbackDefinitions(feedbacks);
    }
}