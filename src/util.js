
module.exports = {
	addZero(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	},

	renameTimestamp() {
		let self = this

		let d = new Date();
		let curr_date = self.addZero(d.getDate());
		let curr_month = self.addZero(d.getMonth() + 1);
		let curr_year = self.addZero(d.getFullYear());
		let h = self.addZero(d.getHours());
		let m = self.addZero(d.getMinutes());
		let stamp = curr_year + "" + curr_month + "" + curr_date + "_" + h + m;
		return stamp;
	},
}