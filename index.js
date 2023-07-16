const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

morgan.token('body', (req, res) => {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    else return ''
})

//this configuration is exactly as tiny configuration, but adding our new token to log the body of the request aswell
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))
    // app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

let persons = [{
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]



app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)
    if (person)
        response.json(person)
    else
        response.status(404).end()

})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(note => note.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const personCreated = request.body
    if (!personCreated.name || !personCreated.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    if (persons.find(person => person.name === personCreated.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    personCreated.id = Math.floor(Math.random() * 100000)
    persons = persons.concat(personCreated)
    response.json(personCreated)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})