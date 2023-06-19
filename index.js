const express = require('express')
const { exec } = require('child_process');
const app = express()
const Docker = require('dockerode');

const docker = new Docker();;
const port = 3000

app.get('/', (req, res) => res.json([{
    "name": "bob",
    "email": "bob@gmail.com"
}]))

app.get("/:session/container/setup", function (req, res) {

    let port = req.query.port;

    docker.listContainers({ all: true }, (err, containers) => { 
        if (err) {
            console.error(err);
            return;
        }

        const container = containers.find(c => c.Names.includes('/user-api-' + req.params.session));

        console.log(container);

        if (container) {
            console.log('Container is running'); 
            return;
        }

        const createOpts = {
            Image: 'nginx:latest',
            name: 'nginx-' + req.params.session,
            ExposedPorts: {
                "1337/tcp": {}
            },
            HostConfig: {
                PortBindings: {
                    '1337/tcp': [{
                        HostPort: port.toString()
                    }],
                },
            },
        };

        docker.createContainer(createOpts, function (err, container) {
            if (err) {
                console.error(err);
                return;
            }

            container.start(function (err, data) {
                if (err) {
                    console.error(err);
                    return;
                }

                console.log(data);
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