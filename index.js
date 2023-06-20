const express = require('express')
const { exec } = require('child_process');
const app = express()
const Docker = require('dockerode');
const tcp_port_used = require('tcp-port-used');

const docker = new Docker();;
const port = 5000

app.get('/', (req, res) => res.json("Connected"))

app.post("/container/:container/port/:port/setup", function (req, res) {

    let port = req.params.port;

    docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
            res.json(err);
            return;
        }

        const container = containers.find(c => c.Names.includes('/superchat-' + req.params.container));

        if (container) {
            res.json('Container is running');
            return;
        }

        tcp_port_used.check(port).then(function (e) {
            if (e == true) {
                res.json('Port is already allocated');
                return;
            }  
        }, function (err) {
            res.json(err);
            return;
        })

        const createOpts = {
            Image: 'superchat:latest',
            name: 'superchat-' + req.params.container,
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
                res.json(err);
                return;
            }

            container.start(function (err, data) {
                if (err) { 
                    res.json(err);
                    return;
                }
 
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
    console.log(`App listening on port ${port}`)
})