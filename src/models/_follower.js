import { v4 as uuidv4 } from 'uuid';

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class Follower {
    constructor(classCode, name, uniqueId = uuidv4()) {
        this.classCode = classCode;
        this.uniqueId = uniqueId;
        this.name = name;
    }

    //Basic accessors
    getName = () => {
        return this.name;
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
        return (
            JSON.parse(
                `{
                    "${this.uniqueId}": {
                        "name": "${this.name}",
                        "currentTab": "",
                        "screenshot": "",
                        "request": {
                            "message":""
                        },
                        "response": {
                            "message":""
                        }
                    }
                }`
            )
        );
    }
}

export default Follower;