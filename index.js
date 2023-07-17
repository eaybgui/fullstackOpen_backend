const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
const app = express()
const Person = require('./models/person')

morgan.token('body', (req, res) => {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    else return ''
})

//this configuration is exactly as tiny configuration, but adding our new token to log the body of the request aswell
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) response.json(person)
        else response.status(404).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = request.body
    const personUpdated = {
        name: person.name,
        number: person.number
    }

    Person.findByIdAndUpdate(request.params.id, personUpdated, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const personCreated = request.body
    if (!personCreated.name || !personCreated.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: personCreated.name,
        number: personCreated.number
    })

    person.save()
        .then(savedPerson => {
            return savedPerson.toJSON()
        })
        .then(formattedPerson => {
            response.json(formattedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({
            error: error.message
        })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})