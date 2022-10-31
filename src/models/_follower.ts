import { v4 as uuidv4 } from 'uuid';
import Tab from "./_tab";

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class Follower {
    classCode: string;
    name: string;
    uniqueId: string;
    tabs: Tab[];
    webRTC: any;
    UUID: any;
    imageBase64: string|null|undefined;
    monitoring: boolean|null|undefined;
    muted: boolean|null|undefined;
    muteAll: boolean|null|undefined;

    constructor(classCode = "", name = "", uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
        this.tabs = [];
    }

    updateIndividualTab(id: string, newTab: Tab)
    {
        const index = this.tabs.findIndex(tab => (tab.id + "") === id)
        if (index !== -1) {
            this.tabs.splice(index, 1, newTab)
        } else {
            this.tabs.push(newTab)
        }
    }

    removeTab(id: string)
    {
        const index = this.tabs.findIndex(tab => (tab.id + "") === id)
        if (index !== -1) {
            this.tabs.splice(index, 1)
        }
    }

    getClassCode = () => {
        return this.classCode;
    }

    getUniqueId = () => {
        return this.uniqueId;
    }

    /**
     * Collect the necessary data to create a new room on the firebase database.
     * @returns A JSON object reflecting the leader's information
     */
    getFollowerObject = () => {
        const obj = {}
        obj[this.uniqueId] = {
            name: this.name,
            screenshot: "",
            request: {
                message: ""
            },
            response: {
                message: ""
            }
        }
        return obj
    }

    getTabsObject = () => {
        const obj = {}
        obj[this.uniqueId] = {
            ...this.tabs
        }
        return obj
    }
}

export default Follower;