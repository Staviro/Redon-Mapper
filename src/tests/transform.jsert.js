import {RedonMapper} from "../lib/redon-mapper.js"
import {Jsert, JsertTargets} from "../js/jsert.mjs"
import {mockUser} from "../mock/mock-user.js"
import {userTemplate} from "../templates/user.tmpl.js"

const jsert = new Jsert({
	group: "Transform Tests",
	target: JsertTargets.terminal
})

jsert.test(
	"registerdDate should be of type 'object' when transformed in template definition",
	function () {
		const data = RedonMapper.map(mockUser, userTemplate)
		jsert.passWhen(this, typeof data.registeredDate === "object")
	}
)

export const transformJsert = jsert
