import {v4 as uuidv4} from 'uuid';

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class Follower {
    constructor(code, name) {
        this.code = code;
        this.uniqueId = uuidv4();
        this.name = name;
    }

    //Basic accessors
    getName = () => {
        return this.name;
    }

    getClassCode = () => {
        return this.code;
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
                        "currentTab": ""
                    }
                }`
            )
        );
    }    
}

export default Follower;