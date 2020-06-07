const express = require("express")
const server = express()

// Pegar o Banco de Dados
const db = require("./database/db.js")

// Configurar pasta pública
server.use(express.static("public"))

// Habilitar o uso do req.body na aplicação
server.use(express.urlencoded({ extended:true }))

// Utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// Configurar caminhos da aplicação
server.get("/", (req,res) => {
    return res.render("index.html", { title: "Um título"})
})

server.get("/create-point", (req,res) => {
    return res.render("create-point.html")
}) 

server.post("/savepoint", (req,res) => {
    // Inserir dados no Banco de Dados
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]
    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true})
    }
    
    db.run(query, values, afterInsertData)
})

server.get("/search", (req,res) => {
    const search = req.query.search

    if(search == "") {
        return res.render("search-results.html", { total: 0})
    }

    // Pegar os dados do Banco de Dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length

        // Mostrar a página HTML com os dados do Banco de Dados
        return res.render("search-results.html", { places: rows, total: total})
    })
})

server.listen(3000)