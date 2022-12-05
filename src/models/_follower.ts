// @ts-ignore
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
    collectingScreenshotFailed: boolean|null|undefined;
    monitoring: boolean|null|undefined;
    permission: string|null|undefined;
    muted: boolean|null|undefined;
    muteAll: boolean|null|undefined;
    offTask: boolean|null|undefined;
    disconnected: boolean = false;

    constructor(classCode = "", name = "", uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
        this.tabs = [];
        this.permission = null;
    }

    updateIndividualTab(id: string, newTab: Tab)
    {
        const index = this.tabs.findIndex(tab => (tab.id + "") === id)
        if (index !== -1) {
            const obj = <Tab>this.tabs[index];
            Object.keys(obj).forEach(key => {
                // @ts-ignore
                obj[key] = newTab[key];
            });
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
        // @ts-ignore
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
        // @ts-ignore
        const tabsKeyValue = {}
        this.tabs.forEach(tab => {
            // @ts-ignore
            tabsKeyValue[tab.id] = tab
        })
        // @ts-ignore
        obj[this.uniqueId] = {
            ...tabsKeyValue
        }
        return obj
    }
}

export default Follower;