import { defineStore } from "pinia";
import Lesson from "../models/lesson";
import { default as axios } from 'axios';
import {getAuth} from "@firebase/auth";
import Bookmark from "../models/bookmark";
import tag from "../models/tag";


const apiBase = 'http://127.0.0.1:5001/browserextension-bc94e/asia-southeast1/api'

export const useLessonPlanningStore = defineStore('lessonPlanning', {
    state: () => {
        return {
            lessons: <Lesson[]>([]),
            bookmarks: <Bookmark[]>([]),
            bookmarksPagination: <any>{},
            view: 'lessons'
        }
    },

    actions: {
        loadLessons() {
            return axios.get(apiBase + '/lesson', {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }

            }).then(({ data }) => {
                this.lessons = data
            })
        },

        createLesson(lessonDto: createLessonDto) {
            return axios.post(apiBase + '/lesson', lessonDto, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }
            }).then((response) => {
                return response
            } )
        },

        loadBookmarks({ search, page }: { search: string, page: number }) {
            let query = '/bookmark'
            if (search !== null && search.length > 0) {
                query += `?search=${search}`
            }
            if (page !== null) {
                query += `?page=${page}`
            }
            return axios.get(apiBase + query, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }

            }).then(({ data }) => {
                this.bookmarks = data.data
                this.bookmarksPagination = data.meta
            })
        },

        createBookmark(bookmarkDto: createBookmarkDto) {
            return axios.post(apiBase + '/bookmark', bookmarkDto, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }
            }).then((response) => {
                return response
            } )
        },

        saveBookmarkAsLessonPart(lessonId: string, bookmarkId: string) {
            return axios.post(apiBase + `/lesson/${lessonId}/attach_bookmark/${bookmarkId}`, {}, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }
            }).then((response) => {
                return response
            } )
        },

        createLessonPart(lessonId: string, lessonPartDto: createLessonPartDto) {
            return axios.post(apiBase + '/lesson-part', { lessonId, ...lessonPartDto }, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }
            }).then((response) => {
                return response
            } )
        },

        setView(view: string) {
            this.view = view
        },

        searchTags(search: string) {
            return axios.get(apiBase + `/tag?search=${search}`, {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }
            }).then(({ data }) => {
                return data
            })
        }
    }
})

type createLessonDto = {
    name: string
    description: string
    yearLevels: string;
    tags: Array<tag>
}

type createBookmarkDto = {
    name: string
    description: string
    yearLevels: string;
    action: string;
    actionType: string;
    tags: Array<tag>
}

type createLessonPartDto = {
    name: string
    description: string
    yearLevels: string;
    action: string;
    actionType: string;
}