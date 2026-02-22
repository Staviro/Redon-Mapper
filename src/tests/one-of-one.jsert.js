import {Jsert, JsertTargets} from "../js/jsert.mjs"
import {RedonMapper} from "../lib/redon-mapper.js"

const apiResponse = [
	{
		username: "mike_code",
		id: "e5f6g7h8i9",
		regDate: "2024-02-29T11:15:00Z",
		userType: "admin"
	},
	{
		user: "user1",
		userId: "a1b2c3d4e5",
		registrationDate: "2024-01-15T09:30:00Z",
		role: "user"
	},
	{
		name: "user2",
		_id: "f1g2h3i4j5",
		_date: "2024-03-10T14:45:00Z",
		role: "editor"
	}
]

const template = {
	username: {sourceKeys: ["username", "user", "name"], type: "string"},
	id: {sourceKeys: ["id", "userId", "_id"], type: "string"},
	registeredDate: {
		sourceKeys: ["regDate", "registrationDate", "_date"],
		transform: (value) => new Date(value),
		defaultValue: new Date("2024-01-01T00:00:00Z")
	},
	userType: {sourceKeys: ["userType", "role"], defaultValue: "user"}
}

const jsert = new Jsert({
	group: "One of One Tests",
	target: JsertTargets.terminal
})

jsert.test(
	"After mapping, the first record should have the correct username, id, and registeredDate",
	async function () {
		const data = RedonMapper.map(apiResponse, template)
		const result =
			data[0].username === "mike_code" &&
			data[0].id === "e5f6g7h8i9" &&
			data[0].registeredDate.getTime() ===
				new Date("2024-02-29T11:15:00Z").getTime() &&
			data[0].userType === "admin"
		jsert.passWhenTruthy(this, result)
	}
)

await jsert.run()
