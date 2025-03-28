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
    teacherName: string
    uniqueId: string;
    tabs: Tab[];
    webRTC: any;
    UUID: any;
    permission: string|null|undefined;

    constructor(classCode = "", name = "", teacherName = "", uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
        this.teacherName = teacherName;
        this.tabs = [];
        this.permission = null;
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

    getName = () => {
        return this.name;
    }

    getTeacherName = () => {
        return this.teacherName;
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