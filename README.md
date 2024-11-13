# Message broker for integrating embedded systems in Microworlds
## Setup Instructions
### Setting up the WLAN Network

First, ensure your Raspberry Pi 4 is set up to provide a WLAN network. In case you are not using a Raspberry Pi 4 to run the message broker or you want a router to create the WLAN network, make sure that the message broker has a static IP address. This ensures that the embedded systems and the Microworlds can always reach the message broker at a consistent IP address.

### Installing the Message Broker

Be aware that the message broker requires Node.js to be installed on the Raspberry Pi 4 or whichever system you are using, with a minimum version of 18.
Clone the repository on your system and checkout to the "pellonara" branch.
After that, open a terminal in the repository directory and run the following commands to install the necessary dependencies:

```
npm install express ws
npm install
```

### Starting up the Message Broker

The message broker is now ready to go! Start it up by running:

```
node index.js
```

You can also access the framework's overview by opening the following URL in your browser:

```
http://MESSAGE_BROKER_IP_ADDRESS
```

Replace MESSAGE_BROKER_IP_ADDRESS with the static IP address of your Raspberry Pi 4 or whichever system you are using.

By following these steps, your message broker will be up and running, providing a stable and accessible WLAN network for your embedded systems and Microworlds.
