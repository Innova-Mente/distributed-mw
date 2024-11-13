# Message broker for integrating embedded systems in Microworlds
## Setup Instructions

In this same repository you can also find [a setup script](https://github.com/Innova-Mente/distrib-mw/blob/pellonara/setup-script.sh) that does this whole process automatically and can get your Raspberry Pi 4 to run the message broker and a WLAN straight out of the box.

### Setting up the WLAN Network

First, ensure your Raspberry Pi 4 is set up to provide a WLAN network. In case you are not using a Raspberry Pi 4 to run the message broker or you want a router to create the WLAN network, make sure that the message broker has a static IP address. This ensures that the embedded systems and the Microworlds can always reach the message broker at a consistent IP address.

In case you want your Raspberry Pi 4 to provide a WLAN network but don't know how to configure it to do so, follow [this guide](https://raspberrypi-guide.github.io/networking/create-wireless-access-point). Be aware that in the guide the WLAN is set up to be able to offer about 50 IP addresses maximum. I highly suggest to increase that number to not run into problems.

### Installing the Message Broker

Be aware that the message broker requires Node.js to be installed on the Raspberry Pi 4 or whichever system you are using, with a minimum version of 18.
Here is [a guide](https://xavier.arnaus.net/blog/install-nodejs-20-into-a-raspberry-pi-4) that shows step by step how to install Node.js v20 on a Raspberry Pi 4.
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

In case you want to automatically run the message broker after the Raspberry Pi 4 boots follow [this guide](https://stackoverflow.com/questions/21542304/how-to-start-a-node-js-app-on-system-boot).
