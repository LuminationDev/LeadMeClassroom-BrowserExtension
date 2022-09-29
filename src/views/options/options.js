import './options.css';

//Get all currently active permissions -> [origins, permission]
chrome.permissions.getAll((granted) => {
    granted.permissions.forEach(permission => {
        document.getElementById(permission).checked = true;
    });
});

//More permissions found here https://developer.chrome.com/docs/extensions/mv3/declare_permissions/
document.getElementsByName("permissionChange").forEach(btn => {
    btn.onclick = (e) => {
        if (e.target.checked) {
            enablePermission(e.target);
        } else {
            removePermission(e.target.id);
        }
    }
});

/**
 * Disable a permission within the extension, this will remain disables until
 * it is either requested by the extension or manually re-enabled.
 * @param {*} id 
 */
function removePermission(id) {
    chrome.permissions.remove({
        permissions: [id],
    });
}

/**
 * Enable a permission within the extension, this will remain enabled until
 * it is manually disabled or the extension is uninstall.
 * @param {*} target The element that has been triggered 
 */
function enablePermission(target) {
    chrome.permissions.request({
        permissions: [target.id],
    }, (granted) => {
        if (!granted) {
            target.checked = false;
        }
    });
}
