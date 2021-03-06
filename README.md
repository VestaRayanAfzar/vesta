# vesta
**[Vesta Boot](https://vesta.bz) Platform**

## Installation
    npm install -g vesta

**Always use `vesta --help` fro the latest commends and options**

## Technologies and Frameworks
* Docker
* TypeScript
* Node
* React

## Commands

### `vesta create`
This command will create a project using one of our scaffolding templates based on the options you provide [use `vesta create --help` for more information]:
* Server side
  * [RESTful Api](https://github.com/vestaBoot/vesta-template-api) Backend application based on Express framework
* Client side
  * [Client Application](https://github.com/vestaBoot/vesta-template-client) This project contains build process for any of Web, Cordova, and Electron targets

All these project are common in some files which are exported to a new project ([Common](https://github.com/vestaBoot/vesta-template-cmn)) 
which will be copied/submoduled  into a sub directory of generated project.

If you want to init git repository you have to create them on your remote git repository server before using `vesta create`.

### `vesta gen`
Generate each of the below items  [use `vesta gen --help` for more information]:
```vesta
model           [Client, Server]
controller      [Server]
component       [Client]
```
For getting help on any of the above items you may use `vesta gen <item> --help`

### `vesta update`
This command will __UNSAFE__ update npm packages that are installed in your project's `package.json` file
* `vesta update` will only update all vesta packages (`@vesta/*`)
* `vesta update --all` will update all packages mentioned at `dependencies` 
* `vesta update --dev` will update all packages mentioned at `devDependencies` 

### `vesta deploy (httpGitRepository | previousDeployConfigFile) [ext params]`<sup>1</sup>
After cloning the project from the url, the deploy process will start.
Deploy process Will move `resources/ci/deploy.sh` file to the project's root directory and  execute it.

Any `ext params` of any kind provided to the commend will be passed to `deploy.sh` script respectively after `CLONE_PATH` and `DEPLOY_PATH`,
 so it will be like `/path/to/deploy.sh CLONE_PATH DEPLY_PATH ext params`

### `vesta docker COMMAND [options...] [PATH]` __experimental__
**enhancement on some docker operations**
* COMMAND
  * `clean` Removes all orphan volumes, networks, and images with no name
  * `ps ` Displays the relevant containers info of specified PATH
  * `up` Executes `docker compose up -d` on the path specified by PATH.
        The PATH is the name of the file generated by `vesta deploy`.
        If no PATH is mentioned, vesta will look for 'docker-compose.yml' file
  * `down` Executes `docker compose down` on the path specified by PATH
  * `scale` Executes 'docker compose scale' on the path specified by PATH.
        This command will only scale the 'api' container of the specific project. Then vesta will obtain the new container's ip and port and updates the upstream section of nginx configuration file.
         You still need to restart the loadBalancer/reverseProxy service manually for the changes to take effect

### `vesta backup [previousDeployConfigFile]`
This will mount all volumes of this project into a _`busybox`_ image and then export (`docker export`) them into a tar file 
named `backup_yyyymmdd-hhmmss.tar`. The container will be removed finally.

If `vesta backup` command is used (without any fileName), the vesta will look for `docker-compose.yml` file in current directory. If it's found based on the volumes on the compose file the backup tar file will be created, otherwise it will
log an error.

_**WARNING!**_ mount volumes will be merged into a single _`busybox`_ container, so if there are more than one directory with the same path even inside different containers, they will be merged together. 

1) `previousDeployConfigFile` is the path to the json file generated by `vesta deploy` command
