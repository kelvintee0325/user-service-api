const express = require('express')
const { exec } = require('child_process');
const app = express()
const Docker = require('dockerode');

const docker = new Docker();;
const port = 5000

app.get('/', (req, res) => res.json("OK"))

app.post("/docker/port/:port/setup", function (req, res) {

    let port = req.params.port;

    docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
            return res.json(err);
        }

        const container = containers.find(c => c.Names.includes('/superchat-' + port.toString()));

        if (container) {
            return res.status(400).send({ Message: 'Container is running.' });
        }

        const createOpts = {
            Image: 'superchat:20231226',
            name: 'superchat-' + port.toString(),
            ExposedPorts: {
                "3000/tcp": {}
            },
            HostConfig: {
                PortBindings: {
                    '3000/tcp': [{
                        HostPort: port.toString()
                    }],
                },
                Binds: [`${process.cwd()}/tokens:/app/tokens`],
                Memory: 2 * 1024 * 1024 * 1024,
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

                return res.status(201).send({ Message: 'New resource has been created.' });
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

app.post("/docker/port/:port/remove", function (req, res) { 
    let port = req.params.port;
 
    docker.listContainers({ all: true }, (err, containers) => {
        if (err) {
            return res.json(err);
        }

        const container_info = containers.find(c => c.Names.includes('/superchat-' + port.toString()));
 
        if (!container_info) {
            return res.status(400).send({ Message: 'Container is not available.' });
        }
 
        const container_id = container_info.Id;

        const container = docker.getContainer(container_id);

        container.stop(function (stop_err) {
            if (stop_err) {
                return res.status(400).send({ Message: stop_err.toString() }); 
            } else { 
                containerObj.remove(function (remove_err, data) {
                    if (remove_err) {
                        return res.status(400).send({ Message: remove_err.toString() }); 
                    } else {
                        return res.status(204).send({ Message: 'The resource was successfully deleted.' });
                    }
                });
            }
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
