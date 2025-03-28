/**
 * Abstract Class Controller.
 *
 * @class Controller
 */
 class Controller {

    constructor() {
        if (this.constructor == Controller) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
  
    determineAction(action: string) {
        throw new Error("Method 'determineAction()' must be implemented.");
    }
  
}

export default Controller