import { defineStore } from "pinia";

export let usePermissionStore = defineStore("permission", {
    state: () => {
        return {
            permissions: {
                storage: false,
                tabs: false,
                scripting: false,
                activeTab: false,
                identity: false
            }
        };
    },

    actions: {
        /**
         * Disable a permission within the extension, this will remain disables until
         * it is either requested by the extension or manually re-enabled.
         * @param {*} id
         */
        removePermission(name: string) {
            chrome.permissions.remove({
                permissions: [name],
            });
        },

        /**
         * Enable a permission within the extension, this will remain enabled until
         * it is manually disabled or the extension is uninstall.
         * @param {*} target The element that has been triggered
         */
        enablePermission(name: string) {
            chrome.permissions.request({
                permissions: [name],
            }, (granted) => {
                if (!granted) {
                    // @ts-ignore
                    this.permissions[name] = false
                }
            });
        },

        setPermission(permission: string, newValue: boolean) {
            if (newValue) {
                this.enablePermission(permission);
            } else {
                this.removePermission(permission);
            }

            // @ts-ignore
            this.permissions[permission] = newValue
        },
    },

    getters: {

    },
});
