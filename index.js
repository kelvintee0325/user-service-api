const express = require('express')
const { exec } = require('child_process');
const app = express()
const Docker = require('dockerode');
const net = require('net');

const docker = new Docker();;
const port = 5000

app.get('/', (req, res) => res.json("Connected"))

app.post("/container/:container/port/:port/setup", function (req, res) {

    let port = req.params.port;

    docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
            return res.json(err); 
        }

        const container = containers.find(c => c.Names.includes('/superchat-' + req.params.container));

        if (container) {
            return res.json('Container is running'); 
        }

        checkPortAvailability(port)
            .then((isAvailable) => {
                if (isAvailable) {
                    return res.json(`Port ${port} is available.`);
                } else {
                    return res.json(`Port ${port} is not available.`);
                }
            })
            .catch((error) => {
                return res.json('Error occurred while checking port availability:', error); 
            });

              res.json("help");

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
                return res.json(err); 
            }

            container.start(function (err, data) {
                if (err) {
                    return res.json(err); 
                }

                //res.json(data);
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

function checkPortAvailability(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.on('error', () => {
            resolve(false); // Port is not available
        });

        server.listen(port, '127.0.0.1', () => {
            server.close(() => {
                resolve(true); // Port is available
            });
        });
    });
}