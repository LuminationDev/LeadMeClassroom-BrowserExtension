import Bookmark from "./bookmark";
import Lesson from "./lesson";

class LessonPart {
    id: string
    name: string
    description: string
    timeAllocation: string
    action: string
    actionType: string
    created_at: Date
    updated_at: Date
    bookmark: Bookmark
    lesson: Lesson
    imageUrl: string

    constructor(id: string, name: string, description: string, timeAllocation: string, action: string, actionType: string, created_at: Date, updated_at: Date, bookmark: Bookmark, lesson: Lesson, imageUrl: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.timeAllocation = timeAllocation;
        this.action = action;
        this.actionType = actionType;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.bookmark = bookmark;
        this.lesson = lesson;
        this.imageUrl = imageUrl;
    }
}
export default LessonPart