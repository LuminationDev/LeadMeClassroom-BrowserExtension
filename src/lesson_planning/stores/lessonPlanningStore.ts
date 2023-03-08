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

        loadBookmarks() {
            return axios.get(apiBase + '/bookmark', {
                headers: {
                    // @ts-ignore
                    Authorization: `Bearer ${getAuth().currentUser?.accessToken}`
                }

            }).then(({ data }) => {
                this.bookmarks = data
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

type createBookmarkDto = {
    name: string
    description: string
    yearLevels: string;
    action: string;
    actionType: string;
    tags: Array<tag>
}