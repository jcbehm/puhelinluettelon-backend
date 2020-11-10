require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
var morgan = require('morgan')

app.use(cors())
morgan.token('body', function (req, res) {
    return (req.method === 'POST'
        ? JSON.stringify(req.body)
        : " ")
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))
app.use(express.json())

const Person = require('./models/person')

/*
let persons = [
    {
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
*/

// GETs

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the phonebook server!</h1>')
})

app.get('/info', (req, res) => {
    Person.find({}).then(result => {
        const phonebookSizeInfo = ("Phonebook has info for " + result.length + " people<br><br>")
        const date = new Date()
        res.send((phonebookSizeInfo + date))
    })
})

app.get('/api/persons', (req, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })

})

// loput

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    /*
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    */

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

// olemattomien osoitteiden käsittely
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// virheellisten pyyntöjen käsittely
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})