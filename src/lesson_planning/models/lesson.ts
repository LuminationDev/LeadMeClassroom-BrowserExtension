import User from "./user";
import Organisation from "./organisation";
import Tag from "./tag";
import LessonPart from "./lessonPart";

class Lesson {
    id: string
    name: string
    description: string
    yearLevels: string
    created_at: Date
    updated_at: Date
    users: User[]
    organisations: Organisation[]
    tags: Tag[]
    lessonParts: LessonPart[]

    constructor(id: string, name: string, description: string, yearLevels: string, created_at: Date, updated_at: Date, users: User[], organisations: Organisation[], tags: Tag[], lessonParts: LessonPart[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.yearLevels = yearLevels;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.users = users;
        this.organisations = organisations;
        this.tags = tags;
        this.lessonParts = lessonParts;
    }
}
export default Lesson