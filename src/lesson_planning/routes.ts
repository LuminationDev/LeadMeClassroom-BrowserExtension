import LessonPlanningMain from './components/lesson_plans/LessonPlanningMain.vue'
import ViewLessonPlan from './components/lesson_plans/ViewLessonPlan.vue'
import EditLessonPlan from './components/lesson_plans/EditLessonPlan.vue'
import SelectBookmarks from './components/lesson_plans/SelectBookmarks.vue'
import ShowLessonPlans from './components/lesson_plans/ShowLessonPlans.vue'
import BookmarkMain from './components/bookmarks/BookmarkMain.vue'

const routes = [
    { name: 'lessons', path: '/lessons', component: ShowLessonPlans },
    {
        name: 'show-lessons',
        path: '/lessons/show',
        component: ViewLessonPlan
    },
    {
        name: 'view-lesson',
        path: '/lesson/:id/view',
        component: ViewLessonPlan
    },
    {
        name: 'edit-lesson',
        path: '/lesson/:id/edit',
        component: EditLessonPlan
    },
    {
        name: 'select-bookmarks',
        path: '/lesson/:id/select-bookmarks',
        component: SelectBookmarks
    },
    {
        name: 'create-lesson',
        path: '/create-lesson',
        component: EditLessonPlan
    },
    { name: 'bookmarks', path: '/bookmarks', component: BookmarkMain }
]
export { routes }