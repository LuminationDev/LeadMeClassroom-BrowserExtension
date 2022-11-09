import {v4 as uuidv4} from 'uuid';
import { getAuth } from '@firebase/auth'

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class Leader {
    constructor(name) {
        this.uniqueId = uuidv4();
        this.name = name;
        this.code = this.generateCode();
    }

    //Basic accessors
    getName = () => {
        return this.name;
    }

    getUniqueId = () => {
        return this.uniqueId;
    }

    /**
     * Get the current class code that has been randomly generated for this session.
     * @returns The 4 character string class code.
     */
    getClassCode = () => {
        return this.code;
    }

    /**
     * Override the generated code with a saved one.
     * @param code
     */
    setClassCode = (code) => {
        this.code = code;
    }

    /**
     * Generate a random character (digit or letter) code that represents the classroom.
     * @returns A 4 character string that acts as the class code.
     */
     generateCode = () => {
        return Math.random().toString(36).slice(2, 6);
    }

    /**
     * Collect the necessary data to create a new room on the firebase database.
     * @returns A JSON object reflecting the leader's information
     */
    getClassroomObject = () => {
        return (
            JSON.parse(
                `{
                    "${this.code}": {
                        "name": "${this.name}",
                        "classCode": "${this.code}",
                        "uniqueId": "${getAuth().currentUser.uid}",
                        "request": ""
                    }
                }`
            )
        );
    }

    /**
     * Collect the necessary data to create a new room on the firebase database.
     * @returns A JSON object reflecting the leader's information
     */
    getDefaultFollowersObject = () => {
        return (
            JSON.parse(
                `{
                    "${this.code}": "awaiting follower"
                }`
            )
        );
    }

    /**
     * Collect the necessary data to create a new room on the firebase database.
     * @returns A JSON object reflecting the leader's information
     */
    getDefaultFollowerMessagesObject = () => {
        return (
            JSON.parse(
                `{
                    "${this.code}": "awaiting follower"
                }`
            )
        );
    }

    /**
     * Collect the necessary data to create a new room on the firebase database.
     * @returns A JSON object reflecting the leader's information
     */
    getDefaultTabsObject = () => {
        return (
            JSON.parse(
                `{
                    "${this.code}": {}
                }`
            )
        );
    }

    /**
     * Set up the necessary object for ice candidates to be placed/listened to
     * @returns
     */
    getDefaultIceObject = () => {
        return (
            JSON.parse(
                `{
                    "${this.code}": {
                        "leader": {
                            "message": "awaiting connection",
                            "senderId": "0"
                        }
                    }
                }`
            )
        );
    }
}

export default Leader;