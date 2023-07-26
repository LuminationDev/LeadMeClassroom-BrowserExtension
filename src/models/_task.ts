class Task {
    readonly name: string;
    packageName: string;
    readonly type: string;

    constructor(name: string, packageName: string, type: string) {
        this.name = name;
        this.packageName = packageName;
        this.type = type
    }


    getName = () => {
        if(this.type === "Website") {
            return this.packageName;
        }
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

    getDomainFromLink = (): string | null => {
        try {
            console.log(this.packageName);
            if(!this.packageName.startsWith('http')) {
                this.packageName = `https://${this.packageName}`;
            }

            const url = new URL(this.packageName);

            let hostname = url.hostname;

            // Remove "www." from the start of the domain name if it exists
            if (hostname.startsWith('www.')) {
                hostname = hostname.slice(4);
            }

            return hostname;
        } catch (error) {
            console.error('Error parsing the URL:', error);
            return null;
        }
    }
}

export default Task;
