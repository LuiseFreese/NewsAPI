const PORT = process.env.PORT || 8000

const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

// my newspapersites

const newspapers = [
    {
        name: 'nyt',
        address: 'https://www.nytimes.com/',
        baseURL: ''
    },
    {
        name: 'un',
        address: 'https://www.un.org/',
        baseURL: ''
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/',
        baseURL: 'https://www.bbc.co.uk'
    },
    {
        name: 'nyp',
        address: 'https://nypost.com/',
        baseURL: ''
    }
]


const articles = []
//extract title and href attribute from page HMTL from all newspapers when the a contains "Ukraine" using Cheerio
newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const pageHTML = response.data
            const $ = cheerio.load(pageHTML)

            $('a:contains("Ukraine")', pageHTML).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
            //push the articles in the articles array 
                articles.push({
                    title,
                    url: newspaper.baseURL + url,
                    source: newspaper.name
                })
            })

        })
})

//root endpoint
app.get('/', (req, res) => {
    res.json('Welcome to my 📰 News API')
})

//news endpoint - show all articles as json
app.get('/news', (req, res) => {
    res.json(articles)
})

//news/newspaperId endpoint - show all articles of a certain newspaperId such as nyt or bbc
app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    
    axios.get(newspaperAddress)
        .then(response => {
            const pageHTML= response.data
            const $ = cheerio.load(pageHTML)
            const specificArticles = []

            $('a:contains("Ukraine")', pageHTML).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})


app.listen(PORT, () => console.log(`my server is running on PORT ${PORT} 🚀`))