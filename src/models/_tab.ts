class Tab {
    name: string;
    favicon: string;
    url: string;
    id: string;
    index: number;
    windowId: number;
    lastActivated: number;
    closing: boolean = false;
    audible: boolean = false;
    muted: boolean = false;
    muting: boolean = false;

    constructor(id: string, index: number, windowId: number, name: string, favicon: string, url: string, lastActivated: number = Date.now()) {
        this.favicon = favicon;
        this.url = url;
        this.name = name;
        this.id = id;
        this.index = index;
        this.windowId = windowId;
        this.lastActivated = lastActivated
    }
}

export default Tab;