#!/bin/bash

echo "127.0.0.1       localhost" > /etc/hosts
echo "127.0.1.1       " $1  >> /etc/hosts
echo "" >> /etc/hosts
echo "# The following lines are desirable for IPv6 capable hosts">> /etc/hosts
echo "::1     localhost ip6-localhost ip6-loopback">> /etc/hosts
echo "ff02::1 ip6-allnodes">> /etc/hosts
echo "ff02::2 ip6-allrouters">> /etc/hosts


echo $1 > /etc/hostname

reboot
