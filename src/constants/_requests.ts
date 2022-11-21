//General controls
export const ENDSESSION = "end_session";
export const REMOVED = "removedByLeader";

export const CAPTURE = "capture";
export const UPDATE_TAB = "updateTab";
export const UPDATE_ACTIVE_TAB = "updateActiveTab";
export const REMOVE_TAB = "removeTab";
export const DELETE_TAB = "deleteTab";
export const WEBSITE = "website";
export const ASSISTANT_MATCH_URL = "chrome-extension://*/*/assistant.html";

//Web RTC controls
export const MONITORPERMISSION = "video_permission";
export const MONITORDATA = "iceCandidates";
export const MONITORENDED = "video_ended";

//Tab controls
export const FORCEACTIVETAB = "force_active_tab";
export const MAXIMIZE = "maximize";
export const MINIMIZE = "minimize";
export const MUTETAB = "mute_tab";
export const UNMUTETAB = "unmute_tab";
export const PINNED = "pinned";
export const UNPINNED = "unpinned";

//Screen controls
export const SCREENCONTROL = "screenControl";
export const BLOCK = "block";
export const UNBLOCK = "unblock";

//Determine if the request is for a single tab or all of them
export const SINGLETAB = "single_tab";
export const MULTITAB = "multi_tab";

//Video controls
export const YOUTUBE = "youtube";
export const VIDEOPLAY = "play";
export const VIDEOPAUSE = "pause";
export const VIDEOSTOP = "stop";