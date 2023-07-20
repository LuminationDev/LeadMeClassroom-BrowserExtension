class Task {
    readonly name: string;
    readonly packageName: string;
    readonly type: string;

    constructor(name: string, packageName: string, type: string) {
        this.name = name;
        this.packageName = packageName;
        this.type = type
    }

    getName = () => {
        return this.name;
    }

    getPackageName = () => {
        return this.packageName;
    }

    getType = () => {
        return this.type;
    }

    toStorageString = () => {
        `{name:${this.name}, packageName:${this.packageName}, type:${this.type}`;
    }
}

export default Task;
