const express = require('express')
const { exec } = require('child_process');
const app = express()
 
const port = process.env.PORT || 8080

app.get('/', (req, res) => res.json([{
    "name": "bob" + port,
    "email": "bob@gmail.com"
}]))
 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})