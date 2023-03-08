import User from "./user";
import Organisation from "./organisation";
import Tag from "./tag";
import LessonPart from "./lessonPart";

class Bookmark {
    id: string
    name: string
    description: string
    yearLevels: string
    action: string
    actionType: string
    created_at: Date
    updated_at: Date
    users: User[]
    organisations: Organisation[]
    tags: Tag[]
    lessonParts: LessonPart[]

    constructor(id: string, name: string, description: string, yearLevels: string, action: string, actionType: string, created_at: Date, updated_at: Date, users: User[], organisations: Organisation[], tags: Tag[], lessonParts: LessonPart[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.yearLevels = yearLevels;
        this.action = action;
        this.actionType = actionType;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.users = users;
        this.organisations = organisations;
        this.tags = tags;
        this.lessonParts = lessonParts;
    }
}
export default Bookmark