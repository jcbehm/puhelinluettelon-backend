const mongoose = require('mongoose')

// Jos salasanaa ei anneta, ei yhdistetä.
if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

// Jos annetaan, yhdistetään.
const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@cluster0.xskra.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

// Jos ei anneta parametrejä, näytetään puhelinluettelo.
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    id: Number,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}
else {
    // Jos annetaan, lisätään uusi henkilö.
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
        id: Math.floor(Math.random() * 1000),
    })


    person.save().then(response => {
        console.log(`added ${process.argv[3]} ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}

