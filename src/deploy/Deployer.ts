import * as fs from "fs-extra";
import * as _ from "lodash";
import {GitGen} from "../gen/file/GitGen";
import {FsUtil} from "../util/FsUtil";
import {Log} from "../util/Log";
import {CmdUtil} from "../util/CmdUtil";
import {Err} from "vesta-util/Err";
import {GregorianDate} from "vesta-datetime-gregorian/GregorianDate";

export interface IDeployHistory {
    date: string;
    type: 'deploy'|'backup';
}
/**
 * projectName      ProjectGroupName-projectName (automatic)
 * deployPath       app/ProjectGroupName-projectName (automatic)
 * repositoryUrl    Url to the project repository
 * args             Extra argument to be passed to deploy script
 */
export interface IDeployConfig {
    projectName: string;
    deployPath: string;
    repositoryUrl: string;
    history: Array<IDeployHistory>;
    args: Array<string>;
}

export class Deployer {
    private static ConfigFile: string;
    private cloningPath: string;
    private alreadyCloned: boolean = false;

    constructor(private config: IDeployConfig) {
        var date = new GregorianDate();
        this.config.history.push({date: date.format('Y/m/d H:i:s'), type: 'deploy'});
        this.cloningPath = config.projectName;
        if (fs.existsSync(this.cloningPath)) {
            // FsUtil.remove(this.cloningPath);
            this.alreadyCloned = true;
        } else {
            FsUtil.mkdir(config.deployPath);
        }
    }

    public deploy() {
        var deployPath = `${this.config.deployPath}/${this.config.projectName}`;
        var args = [this.cloningPath, deployPath];
        args = args.concat(this.config.args);
        if (this.alreadyCloned) {
            CmdUtil.execSync(`git reset --hard origin/master`, {cwd: this.cloningPath});
            CmdUtil.execSync(`git pull origin master`, {cwd: this.cloningPath});
        } else {
            GitGen.clone(this.config.repositoryUrl, this.cloningPath);
        }
        CmdUtil.execSync(`git checkout master`, {cwd: this.cloningPath});
        FsUtil.copy(`${this.cloningPath}/resources/ci/deploy.sh`, `${this.cloningPath}/deploy.sh`);
        CmdUtil.execSync(`chmod +x ${this.cloningPath}/deploy.sh`);
        CmdUtil.execSync(`${process.cwd()}/${this.cloningPath}/deploy.sh ${args.join(' ')}`);
        FsUtil.writeFile(Deployer.ConfigFile, JSON.stringify(this.config, null, 2));
        // FsUtil.remove(this.cloningPath);
    }

    private static getProjectName(url: string) {
        var [,group,project]=/.+\/(.+)\/(.+)\.git$/.exec(url);
        return `${group}-${project}`;
    }

    public static getDeployConfig(args: Array<string>): Promise<IDeployConfig> {
        if (CmdUtil.execSync(`gulp -v`, {silent: true}).code) {
            Log.error('You must install gulp-cli! Run `sudo npm install -g gulp-cli`');
            return Promise.reject(new Err(Err.Code.OperationFailed, 'gulp-cli is not installed'));
        }
        var config: IDeployConfig = <IDeployConfig>{
            history: [],
            args: [],
            deployPath: `app`
        };
        if (!args[0]) {
            Log.error('Invalid file name or HTTP url of remote repository');
            return Promise.reject(new Err(Err.Code.WrongInput));
        }
        Log.warning('\nWARNING: Make sure that your `master` branch is updated and contains the final changes!\n');
        if (fs.existsSync(args[0])) {
            _.assign(config, Deployer.fetchConfig(args[0]));
            Deployer.ConfigFile = `${config.projectName}.json`;
            return Promise.resolve(config);
        }
        config.repositoryUrl = args[0];
        config.projectName = Deployer.getProjectName(config.repositoryUrl);
        Deployer.ConfigFile = `${config.projectName}.json`;
        config.args = args.slice(1);
        return Promise.resolve(config);
    }

    public static fetchConfig(filename: string): IDeployConfig {
        var config: IDeployConfig = <IDeployConfig>{};
        try {
            config = JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}));
        } catch (e) {
            Log.error(`Deploy config file -${filename}- is corrupted!`);
            return null;
        }
        return config;
    }
}