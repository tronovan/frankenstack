# Frankenstack
private cloud clustering for virtualbox

In order to set this up, you're going to need to install VirtualBox on the hosts where you want to provision VMs.   You must generate a ssh key for the server where you'll be running Frankenstack and you must copy that key to all other hosts where VMs will be provisioned.

In order for wake on lan to work for the hosts, your network and nics must support it.

When creating OS images, you must configure them to run an announce script at start up.   Different OSs will have a different proceedure, but in Ubuntu, you can place the announce script in /etc/rc.d.

The announce script will call the hostname_change script.


