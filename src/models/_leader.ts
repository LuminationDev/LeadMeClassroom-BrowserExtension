import { v4 as uuidv4 } from 'uuid';
import { getAuth } from '@firebase/auth'

/**
 * A class to describe the outline of a follower that is being attached
 * to the firebase leader.
 */
class Leader {
    private readonly uniqueId: string;
    private readonly name: string;
    private code: string;

    constructor(name: string) {
        this.uniqueId = uuidv4();
        this.name = name;
        this.code = this.generateCode(4);
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
    setClassCode = (code: string) => {
        this.code = code;
    }

    /**
     * Generate a random character (digit or letter) code that represents the classroom.
     * @returns A 4 character string that acts as the class code.
     */
     generateCode = (length: number) => {
         let result = ''
         const characters = 'abcdefghjkmnpqrstuvwxyz23456789'
         const charactersLength = characters.length
         for (let i = 0; i < length; i++) {
             result += characters.charAt((Math.floor(Math.random() * charactersLength)))
         }
         return result
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
                        "uniqueId": "${getAuth().currentUser!.uid}",
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