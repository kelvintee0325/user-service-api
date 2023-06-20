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
            res.json(err);
            return;
        }

        const container = containers.find(c => c.Names.includes('/superchat-' + req.params.container));

        if (container) {
            res.json('Container is running');
            return;
        }

        checkPortAvailability(port)
        .then((isAvailable) => {
          if (isAvailable) {
            console.log(`Port ${port} is available.`);
          } else {
            console.log(`Port ${port} is not available.`);
            return;
          }
        })
        .catch((error) => {
            res.json('Error occurred while checking port availability:', error);
            return;
        });

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
  