#!/bin/bash

# You can download this script by running the following command:
# curl -O https://raw.githubusercontent.com/Innova-Mente/distrib-mw/pellonara/setup-script.sh
# !!! Before running the script, run the following commands and reboot the system afterwards:
# sudo apt update
# sudo apt upgrade
# sudo apt install curl

# This script is meant to be run on a Raspberry Pi 4 with a fresh install of Raspbian OS
# The script will download the middleware, set up a wireless access point, install the right version of Node.js and set up the middleware to start on boot
# You can also plug a wired connection to the Raspberry Pi to allow internet access to the devices connected to the wireless access point
# Although the speed wasn't great from my tests, it's highly suggested to download locally Snap! on the user devices to avoid any issues

# The following guides were used to create this script:
# https://raspberrypi-guide.github.io/networking/create-wireless-access-point
# https://stackoverflow.com/questions/21542304/how-to-start-a-node-js-app-on-system-boot
# https://xavier.arnaus.net/blog/install-nodejs-20-into-a-raspberry-pi-4

echo "Run this script in your system's Downloads folder"

if [ "$#" -ne 2 ]; then
  echo "Error: This script requires exactly 2 arguments. The PACKAGE_ID and WIFI_PASSWORD"
  echo "Example: ./setup-script.sh 2daY6 UNIBO1234"
  exit 1
fi

PACKAGE_ID=$1
WIFI_PASSWORD=$2

WIFI_NAME="Rete $PACKAGE_ID dei MicroMondi"

sudo apt install -y netfilter-persistent unzip

echo "Downloading the middleware"

curl -L https://github.com/Innova-Mente/distrib-mw/archive/refs/tags/v0.0.1.zip -o distrib-mw.zip
unzip distrib-mw.zip -d distrib-mw
mv distrib-mw/distrib-mw*/* distrib-mw/
rm -rf distrib-mw/distrib-mw*
rm distrib-mw.zip

echo "Download is complete"
echo "Setting up the wireless access point"

sudo apt install -y dnsmasq hostapd
sudo systemctl stop dnsmasq
sudo systemctl stop hostapd

echo "interface wlan0
  static ip_address=192.168.4.1/24
  nohook wpa_supplicant" | sudo tee -a /etc/dhcpcd.conf > /dev/null

sudo service dhcpcd restart
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

echo "interface=wlan0
dhcp-range=192.168.4.2,192.168.4.50,255.255.255.0,24h" | sudo tee -a /etc/dnsmasq.conf > /dev/null

sudo systemctl start dnsmasq

echo "country_code=IT
interface=wlan0
ssid=$WIFI_NAME
channel=9
auth_algs=1
wpa=2
wpa_passphrase=$WIFI_PASSWORD
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP CCMP
rsn_pairwise=CCMP" | sudo tee -a /etc/hostapd/hostapd.conf > /dev/null

sudo sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd

sudo sed -i '/^#net.ipv4.ip_forward=1/s/^#//' /etc/sysctl.conf

sudo iptables -t nat -A  POSTROUTING -o eth0 -j MASQUERADE
sudo netfilter-persistent save

echo "Finished setting up the wireless access point"
echo "Now installing the right version of Node.js"

sudo apt install -y ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt update
sudo apt install -y nodejs

echo "Node.js installation complete"

echo "Setting up the middleware"

cd distrib-mw
npm install
npm install ws
npm install express

echo "Setting up middleware autostart on boot"

NODEJS_PATH=$(which nodejs)
USER_HOME=$HOME

(crontab -l 2>/dev/null; echo "@reboot sudo $NODEJS_PATH $USER_HOME/Downloads/distrib-mw/index.js &") | sudo crontab -

echo "Setup complete. It's highly recommended to reboot the system now"
