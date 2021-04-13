const express = require('express')
const app = express()
const httpPort = 8000

const now = () => {
	return new Date().toString()
}

const getConsolePrefix = () => {
	return `[${now()}]`
}

app.use(express.static('static'));

console.log(`${getConsolePrefix()} Starting http static server at ${httpPort}`)
app.listen(httpPort)