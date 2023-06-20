const express = require('express')
const { exec } = require('child_process');
const app = express()
const Docker = require('dockerode');

const docker = new Docker();;
const port = 5000

app.get('/', (req, res) => res.json([{
    "name": "bob",
    "email": "bob@gmail.com"
}]))

app.get("/:session/container/setup", function (req, res) {

    let port = req.query.port;

    docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
            console.error(err);
            res.json(err);
            return;
        }

        const container = containers.find(c => c.Names.includes('/superchat-' + req.params.session));

        if (container) {
            console.error('Container is running');
            res.json('Container is running');
            return;
        }

        const createOpts = {
            Image: 'superchat:latest',
            name: 'superchat-' + req.params.session,
            ExposedPorts: {
                "3000/tcp": {}
            },
            HostConfig: {
                PortBindings: {
                    '3000/tcp': [{
                        HostPort: port.toString()
                    }],
                },
            },
        };

        docker.createContainer(createOpts, function (err, container) {
            if (err) {
                console.error(err);
                res.json(err);
                return;
            }

            container.start(function (err, data) {
                if (err) {
                    console.error(err);
                    res.json(err);
                    return;
                }

                console.log(data);
                res.json(data); 
            });
        });
    });

    // exec('docker run --name user-api-7 -d -p 8080:3000 user-service-api:latest', (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    //     console.error(`stderr: ${stderr}`);
    // });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})